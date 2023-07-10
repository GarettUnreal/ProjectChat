// Fill out your copyright notice in the Description page of Project Settings.


#include "ChatGameModeBase.h"
#include "Interfaces/IPv4/IPv4Endpoint.h"
#include "Common/TcpSocketBuilder.h"
#include "SocketSubsystem.h"
#include "IPAddress.h"
//#include "E:\Programs\Epic Games\UE_5.2\Engine\Source\Runtime\Sockets\Public\IPAddressAsyncResolve.h"
#include "IPAddressAsyncResolve.h"
#include <string>

void AChatGameModeBase::BeginPlay()
{
	Super::BeginPlay();

	/*FHttpRequestRef Request = FHttpModule::Get().CreateRequest();
	Request->OnProcessRequestComplete().BindUObject(this, &AChatGameModeBase::OnHTTPRespnose);
	Request->SetURL("https://id.twitch.tv/oauth2/token");
	Request->SetVerb("POST");
	Request->SetHeader("Content-Type", "application/json");
	
	TSharedRef<FJsonObject> RequestObj = MakeShared <FJsonObject>();
	RequestObj->SetStringField("client_id", "k1n0hphapstolp49k9l3i4zjogvk8l");
	RequestObj->SetStringField("client_secret", "8jwy1whwmfre3cnqqpc6jx6ozwyl69");
	RequestObj->SetStringField("grant_type", "client_credentials");
	FString RequestBody;
	TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&RequestBody);
	FJsonSerializer::Serialize(RequestObj, Writer);
	Request->SetContentAsString(RequestBody);
	Request->ProcessRequest();*/

	FString AccessToken = "tdd4ik8kxfiec9y8vl2hd1q4bi0omb";

	FIPv4Endpoint Endpoint(FIPv4Address(127, 0, 0, 1), 6667);
	ListenerSocket = FTcpSocketBuilder(TEXT("TwitchListener"))
		.AsReusable()
		.BoundToEndpoint(Endpoint)
		.Listening(8);

	//Set Buffer Size
	int32 NewSize = 0;
	ListenerSocket->SetReceiveBufferSize(2 * 1024 * 1024, NewSize);

	GetWorldTimerManager().SetTimer(timerHandle, this, &AChatGameModeBase::SocketListener, 0.01, true);

	SendLogin(AccessToken);
}

bool AChatGameModeBase::TryJoinChannel(const FString& Channel)
{
	SendString("PART");
	ChannelToJoin = Channel.ToLower();
	FString JoinRequest = FString("JOIN #").Append(ChannelToJoin);
	return SendString(*JoinRequest);
}

void AChatGameModeBase::SocketListener()
{
	TArray<uint8> ReceivedData;
	uint32 Size;
	bool Received = false;
	while (ListenerSocket->HasPendingData(Size))
	{
		Received = true;
		ReceivedData.SetNumUninitialized(FMath::Min(Size, 65507u));

		int32 Read = 0;
		ListenerSocket->Recv(ReceivedData.GetData(), ReceivedData.Num(), Read);
	}
	if (Received)
	{
		const std::string cstr(reinterpret_cast<const char*>(ReceivedData.GetData()), ReceivedData.Num());
		FString fs(cstr.c_str());
		UE_LOG(LogTemp, Display, TEXT("Recieved Response: '%s'."), *fs);

		ParseMessage(fs);
	}
}

void AChatGameModeBase::ParseMessage(FString msg)
{
	TArray<FString> lines;
	msg.ParseIntoArrayLines(lines);
	for (FString fs : lines)
	{
		TArray<FString> parts;
		fs.ParseIntoArray(parts, TEXT(":"));
		TArray<FString> meta;
		parts[0].ParseIntoArrayWS(meta);
		if (parts.Num() >= 2)
		{
			if (meta[0] == TEXT("PING"))
			{
				SendString(TEXT("PONG :tmi.twitch.tv"));
			}
			else if (meta.Num() == 3 && meta[1] == TEXT("PRIVMSG"))
			{
				FString message = parts[1];
				if (parts.Num() > 2)
				{
					for (int i = 2; i < parts.Num(); i++)
					{
						message += TEXT(":") + parts[i];
					}
				}
				FString username;
				FString tmp;
				meta[0].Split(TEXT("!"), &username, &tmp);
				ReceivedChatMessage(username, message);
				continue;
			}
		}
		else if (parts.Num() == 1)
		{
			if (meta.Num() == 3 && meta[1] == TEXT("JOIN"))
			{
				FString ExpectedJoin = FString("#").Append(ChannelToJoin);
				if (meta[2] == *ExpectedJoin)
				{
					OnJoinStatus.Broadcast(true);
				}
			}
		}
	}
}


void AChatGameModeBase::ReceivedChatMessage(FString UserName, FString message)
{
	UE_LOG(LogTemp, Warning, TEXT("%s: %s"), *UserName, *message);
	OnNewChatMessage.Broadcast(UserName, message);
}

void AChatGameModeBase::OnHTTPRespnose(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bConnectedSuccess)
{
	UE_LOG(LogTemp, Display, TEXT("Response: %s"), *Response->GetContentAsString());

	TSharedPtr<FJsonObject> JsonParsed;
	TSharedRef<TJsonReader<TCHAR>> JsonReader = TJsonReaderFactory<TCHAR>::Create(Response->GetContentAsString());
	if (FJsonSerializer::Deserialize(JsonReader, JsonParsed))
	{
		FString AccessToken = JsonParsed->GetStringField("access_token");

		FIPv4Endpoint Endpoint(FIPv4Address(127, 0, 0, 1), 6667);
		ListenerSocket = FTcpSocketBuilder(TEXT("TwitchListener"))
			.AsReusable()
			.BoundToEndpoint(Endpoint)
			.Listening(8);

		//Set Buffer Size
		int32 NewSize = 0;
		ListenerSocket->SetReceiveBufferSize(2 * 1024 * 1024, NewSize);

		GetWorldTimerManager().SetTimer(timerHandle, this, &AChatGameModeBase::SocketListener, 0.01, true);

		SendLogin(AccessToken);
	}
}

void AChatGameModeBase::SendLogin(const FString& AccessToken)
{
	FResolveInfo* ResolveInfo = ISocketSubsystem::Get()->GetHostByName("irc.chat.twitch.tv");
	while (!ResolveInfo->IsComplete());
	if (ResolveInfo->GetErrorCode() != 0)
	{
		UE_LOG(LogTemp, Warning, TEXT("Couldn't resolve hostname."));
		return;
	}

	const FInternetAddr* Addr = &ResolveInfo->GetResolvedAddress();
	uint32 OutIP = 0;
	Addr->GetIp(OutIP);
	int32 port = 6667;

	TSharedRef<FInternetAddr> addr = ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->CreateInternetAddr();
	addr->SetIp(OutIP);
	addr->SetPort(port);

	ListenerSocket = ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->CreateSocket(NAME_Stream, TEXT("default"), false);

	bool connected = ListenerSocket->Connect(*addr);
	if (!connected)
	{
		UE_LOG(LogTemp, Warning, TEXT("Failed to connect."));
		if (ListenerSocket)
			ListenerSocket->Close();
		return;
	}

	FString PassStr = FString("PASS oauth:").Append(*AccessToken);
	SendString(*PassStr);
	SendString(TEXT("NICK guesstogethergame"));
}

bool AChatGameModeBase::SendString(FString msg)
{
	FString serialized = msg + TEXT("\r\n");
	TCHAR * serializedChar = serialized.GetCharArray().GetData();
	int32 size = FCString::Strlen(serializedChar);
	int32 sent = 0;

	if (!ListenerSocket->Send((uint8*)TCHAR_TO_UTF8(serializedChar), size, sent))
	{
		UE_LOG(LogTemp, Warning, TEXT("Failed to send message '%s'."), serializedChar);
		return false;
	}
	else
	{
		UE_LOG(LogTemp, Warning, TEXT("Sent message '%s'."), serializedChar);
	}
	return true;
}
