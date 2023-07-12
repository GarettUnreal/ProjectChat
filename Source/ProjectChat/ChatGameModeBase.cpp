// Fill out your copyright notice in the Description page of Project Settings.


#include "ChatGameModeBase.h"
#include "Interfaces/IPv4/IPv4Endpoint.h"
#include "Common/TcpSocketBuilder.h"
#include "SocketSubsystem.h"
#include "IPAddress.h"
//#include "E:\Programs\Epic Games\UE_5.2\Engine\Source\Runtime\Sockets\Public\IPAddressAsyncResolve.h"
#include "IPAddressAsyncResolve.h"
#include <string>
#include "Kismet/GameplayStatics.h"

TObjectPtr<UWorld> AChatGameModeBase::World = NULL;

AChatGameModeBase::AChatGameModeBase() :
	ConnectionSocket(NULL)
{}

AChatGameModeBase::~AChatGameModeBase()
{
	FHttpServerModule& httpServerModule = FHttpServerModule::Get();
	httpServerModule.StopAllListeners();

	if (ConnectionSocket != NULL)
	{
		if (!ChannelToJoin.IsEmpty())
		{
			SendString(*(FString("PART #").Append(ChannelToJoin.ToLower())));
		}
		SendString("QUIT :Goodbye");
		ConnectionSocket->Close();
		delete ConnectionSocket;
	}
}

void AChatGameModeBase::BeginPlay()
{
	Super::BeginPlay();

	/*PrimaryActorTick.bStartWithTickEnabled = true;
	PrimaryActorTick.bCanEverTick = true;*/

	FHttpServerModule& httpServerModule = FHttpServerModule::Get();
	HttpRouter = httpServerModule.GetHttpRouter(8080);

	if (HttpRouter.IsValid())
	{
		/*HttpRouter->BindRoute(FHttpPath("/callback"), EHttpServerRequestVerbs::VERB_GET,
			[this](const FHttpServerRequest& Request, const FHttpResultCallback& OnComplete) {
				return RequestGETCallback(Request, OnComplete);
			});*/

		UE_LOG(LogTemp, Display, TEXT("AChatGameModeBase::BeginPlay This Object: %s (Is Valid = %s, Class = %s), Connection Socket: %s, Is Valid Socket: %s"),
			*FString::FromInt(IsValid(this) ? static_cast<int32>(this->GetUniqueID()) : -1),
			*FString(IsValid(this) ? "True" : "False"),
			*FString(IsValid(this) ? this->GetClass()->GetName() : "Invalid Name"),
			*FString::FromInt(static_cast<int32>(reinterpret_cast<std::uintptr_t>(ConnectionSocket))),
			*FString(ConnectionSocket != NULL ? "True" : "False"));

		AChatGameModeBase::World = GetWorld();

		HttpRouter->BindRoute(FHttpPath("/callback"), EHttpServerRequestVerbs::VERB_GET,
			[this](const FHttpServerRequest& Request, const FHttpResultCallback& OnComplete) {

				AChatGameModeBase* ChatGameMode = Cast<AChatGameModeBase>(UGameplayStatics::GetGameMode(AChatGameModeBase::World));

				UE_LOG(LogTemp, Display, TEXT("Lambda Function - This Object: %s (Is Valid = %s, Class = %s), Connection Socket: %s, Is Valid Socket: %s"),
				*FString::FromInt(IsValid(ChatGameMode) ? static_cast<int32>(ChatGameMode->GetUniqueID()) : -1),
				*FString(IsValid(ChatGameMode) ? "True" : "False"),
				*FString(IsValid(ChatGameMode) ? ChatGameMode->GetClass()->GetName() : "Invalid Name"),
				*FString::FromInt(static_cast<int32>(reinterpret_cast<std::uintptr_t>(ChatGameMode->ConnectionSocket))),
				*FString(ChatGameMode->ConnectionSocket != NULL ? "True" : "False"));

				return ChatGameMode->RequestGETCallback(Request, OnComplete);
			});
		/*HttpRouter->BindRoute(FHttpPath("/callback"), EHttpServerRequestVerbs::VERB_GET,
			&AChatGameModeBase::RequestGETCallback);*/
		/*HttpRouter->BindRoute(FHttpPath("/auth_tokens"), EHttpServerRequestVerbs::VERB_GET,
			[this](const FHttpServerRequest& Request, const FHttpResultCallback& OnComplete) {
				return RequestGETAuthTokens(Request, OnComplete);
			});*/

		httpServerModule.StartAllListeners();
	}
}

void AChatGameModeBase::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	SocketListener();
}

bool AChatGameModeBase::AuthorizeApp(const FString& Code)
{
	FHttpRequestRef Request = FHttpModule::Get().CreateRequest();

	UE_LOG(LogTemp, Display, TEXT("AChatGameModeBase::AuthorizeApp This Object: %s (Is Valid = %s, Class = %s), Connection Socket: %s, Is Valid Socket: %s"),
		*FString::FromInt(IsValid(this) ? static_cast<int32>(this->GetUniqueID()) : -1),
		*FString(IsValid(this) ? "True" : "False"),
		*FString(IsValid(this) ? this->GetClass()->GetName() : "Invalid Name"),
		*FString::FromInt(static_cast<int32>(reinterpret_cast<std::uintptr_t>(ConnectionSocket))),
		*FString(ConnectionSocket != NULL ? "True" : "False"));
	Request->OnProcessRequestComplete().BindUObject(this, &AChatGameModeBase::OnHTTPRespnose);
	Request->SetURL("https://id.twitch.tv/oauth2/token");
	Request->SetVerb("POST");
	Request->SetHeader("Content-Type", "application/json");

	TSharedRef<FJsonObject> RequestObj = MakeShared <FJsonObject>();
	RequestObj->SetStringField("client_id", "k1n0hphapstolp49k9l3i4zjogvk8l");
	RequestObj->SetStringField("client_secret", "pl2zs6w0zcgiiair9kou5daeao986w");
	RequestObj->SetStringField("code", *Code);
	RequestObj->SetStringField("grant_type", "authorization_code");
	RequestObj->SetStringField("redirect_uri", "http://localhost:8080/callback");
	FString RequestBody;
	TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&RequestBody);
	FJsonSerializer::Serialize(RequestObj, Writer);
	Request->SetContentAsString(RequestBody);
	Request->ProcessRequest();
	return true;
}

void AChatGameModeBase::OnHTTPRespnose(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bConnectedSuccess)
{
	UE_LOG(LogTemp, Display, TEXT("Response: %s"), *Response->GetContentAsString());

	TSharedPtr<FJsonObject> JsonParsed;
	TSharedRef<TJsonReader<TCHAR>> JsonReader = TJsonReaderFactory<TCHAR>::Create(Response->GetContentAsString());
	if (FJsonSerializer::Deserialize(JsonReader, JsonParsed))
	{
		AccessToken = JsonParsed->GetStringField("access_token");

		SendLogin(AccessToken);
		//AuthenticatWithTwitch(AccessToken);
	}
}

bool AChatGameModeBase::GetChannelName(const FString& UserAccessToken)
{
	FHttpRequestRef Request = FHttpModule::Get().CreateRequest();
	Request->OnProcessRequestComplete().BindUObject(this, &AChatGameModeBase::OnGetChannelRespnose);
	Request->SetURL("https://api.twitch.tv/helix/users");
	Request->SetVerb("GET");
	Request->SetHeader("Authorization", *(FString("Bearer ").Append(UserAccessToken)));
	Request->SetHeader("Client-Id", "k1n0hphapstolp49k9l3i4zjogvk8l");
	Request->ProcessRequest();
	return true;
}

void AChatGameModeBase::OnGetChannelRespnose(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bConnectedSuccess)
{
	UE_LOG(LogTemp, Display, TEXT("Response: %s"), *Response->GetContentAsString());

	bool bGetUsernameSuccess = false;

	TSharedPtr<FJsonObject> JsonParsed;
	TSharedRef<TJsonReader<TCHAR>> JsonReader = TJsonReaderFactory<TCHAR>::Create(Response->GetContentAsString());
	if (!bConnectedSuccess)
	{
		UE_LOG(LogTemp, Display, TEXT("GET channel username connection failed."));
	}
	else if (FJsonSerializer::Deserialize(JsonReader, JsonParsed))
	{
		const TArray< TSharedPtr<FJsonValue> > *DataArray;
		TSharedPtr<FJsonObject> *DataObject;
		if (!JsonParsed->TryGetArrayField("data", DataArray))
		{
			UE_LOG(LogTemp, Display, TEXT("OnGetChannelRespnose: Failed to parse \"data\" array."));
		}
		else if (DataArray->Num() != 1)
		{
			UE_LOG(LogTemp, Display, TEXT("OnGetChannelRespnose: \"data\" array should have exactly on element."));
		}
		else if (!(*DataArray)[0]->TryGetObject(DataObject))
		{
			UE_LOG(LogTemp, Display, TEXT("OnGetChannelRespnose: Failed to first \"data\" array element to a JSON object."));
		}
		else if (!(*DataObject)->TryGetStringField("login", ChannelToJoin))
		{
			UE_LOG(LogTemp, Display, TEXT("OnGetChannelRespnose: Failed to extract \"login\" from first data object."));
		}
		else
		{
			UE_LOG(LogTemp, Display, TEXT("Successfully found channel name as '%s'."), *ChannelToJoin);
			bGetUsernameSuccess = TryJoinChannel(ChannelToJoin);
		}
	}

	if (!bGetUsernameSuccess)
	{
		OnConnectedToTwitchStatus.Broadcast("", false);
	}
}

bool AChatGameModeBase::TryJoinChannel(const FString& Channel)
{
	if (!ChannelToJoin.IsEmpty())
	{
		SendString(*(FString("PART #").Append(ChannelToJoin.ToLower())));
	}
	ChannelToJoin = Channel.ToLower();
	FString JoinRequest = FString("JOIN #").Append(ChannelToJoin);
	if (!SendString(*JoinRequest))
	{
		return false;
	}
	return true;
}

bool AChatGameModeBase::RequestGETCallback(const FHttpServerRequest& Request, const FHttpResultCallback& OnComplete)
{
	RequestPrint(Request);
	if (Request.QueryParams.Contains("code"))
	{
		FString Code = Request.QueryParams["code"];

		TUniquePtr<FHttpServerResponse> Response = FHttpServerResponse::Create(
			TEXT("Authorization successful. Guess Together will now attempt to join your chat. You may close this tab or window."), TEXT("text/javascript"));
		Response->Code = EHttpServerResponseCodes::Ok;
		OnComplete(MoveTemp(Response));

		AuthorizeApp(Code);
	}
	else if (Request.QueryParams.Contains("error"))
	{
		UE_LOG(LogTemp, Log, TEXT("Erorr: %s"), *Request.QueryParams["error"]);
		UE_LOG(LogTemp, Log, TEXT("Erorr Description: %s"), *Request.QueryParams["error_description"]);
		OnConnectedToTwitchStatus.Broadcast("", false);
		return false;
	}
	return true;
}

/*bool AChatGameModeBase::RequestGETAuthTokens(const FHttpServerRequest& Request, const FHttpResultCallback& OnComplete)
{
	RequestPrint(Request);
	if (Request.PathParams.Contains("access_token") && Request.PathParams.Contains("refresh_token"))
	{
		FString AccessToken = Request.PathParams["access_token"];
		FString RefreshToken = Request.PathParams["refresh_token"];
		AuthenticatWithTwitch(AccessToken);
	}
	else if (Request.PathParams.Contains("error"))
	{
		UE_LOG(LogTemp, Log, TEXT("Erorr: %s"), *Request.PathParams["error"]);
		UE_LOG(LogTemp, Log, TEXT("Erorr Description: %s"), *Request.PathParams["error_description"]);
		return false;
	}

	return false;
}*/

void AChatGameModeBase::RequestPrint(const FHttpServerRequest& Request, bool PrintBody)
{
	FString strRequestType;
	switch (Request.Verb)
	{
	case EHttpServerRequestVerbs::VERB_GET:
		strRequestType = TEXT("GET");
		break;
	case EHttpServerRequestVerbs::VERB_POST:
		strRequestType = TEXT("POST");
		break;
	case EHttpServerRequestVerbs::VERB_PUT:
		strRequestType = TEXT("PUT");
		break;
	default:
		strRequestType = TEXT("Invalid");
	}
	UE_LOG(LogTemp, Log, TEXT("RequestType = '%s'"), *strRequestType);

	HttpVersion::EHttpServerHttpVersion httpVersion{ Request.HttpVersion };
	UE_LOG(LogTemp, Log, TEXT("HttpVersion = '%s'"), *HttpVersion::ToString(httpVersion));

	UE_LOG(LogTemp, Log, TEXT("RelativePath = '%s'"), *Request.RelativePath.GetPath());

	for (const auto& header : Request.Headers)
	{
		FString strHeaderVals;
		for (const auto& val : header.Value)
		{
			strHeaderVals += TEXT("'") + val + TEXT("' ");
		}
		UE_LOG(LogTemp, Log, TEXT("Header = '%s' : %s"), *header.Key, *strHeaderVals);
	}

	for (const auto& pathParam : Request.PathParams)
	{
		UE_LOG(LogTemp, Log, TEXT("PathParam = '%s' : '%s'"), *pathParam.Key, *pathParam.Value);
	}

	for (const auto& queryParam : Request.QueryParams)
	{
		UE_LOG(LogTemp, Log, TEXT("QueryParam = '%s' : '%s'"), *queryParam.Key, *queryParam.Value);
	}

	// Convert UTF8 to FString
	FUTF8ToTCHAR bodyTCHARData(reinterpret_cast<const ANSICHAR*>(Request.Body.GetData()), Request.Body.Num());
	FString strBodyData{ bodyTCHARData.Length(), bodyTCHARData.Get() };

	UE_LOG(LogTemp, Log, TEXT("Body = '%s'"), *strBodyData);
};

void AChatGameModeBase::SocketListener()
{
	if (ConnectionSocket != NULL)
	{
		TArray<uint8> ReceivedData;
		uint32 Size;
		bool Received = false;
		while (ConnectionSocket->HasPendingData(Size))
		{
			Received = true;
			ReceivedData.SetNumUninitialized(FMath::Min(Size, 65507u));

			int32 Read = 0;
			ConnectionSocket->Recv(ReceivedData.GetData(), ReceivedData.Num(), Read);
		}
		if (Received)
		{
			const std::string cstr(reinterpret_cast<const char*>(ReceivedData.GetData()), ReceivedData.Num());
			FString fs(cstr.c_str());
			UE_LOG(LogTemp, Display, TEXT("Recieved Response: '%s'."), *fs);

			ParseMessage(fs);
		}
	}
	else
	{
		/*UE_LOG(LogTemp, Display, TEXT("Socket Listener Uninitialized. This Object: %s (Is Valid = %s, Class = %s), Connection Socket: %s, Is Valid Socket: %s"),
			*FString::FromInt(IsValid(this) ? static_cast<int32>(this->GetUniqueID()) : -1),
			*FString(IsValid(this) ? "True" : "False"),
			*FString(IsValid(this) ? this->GetClass()->GetName() : "Invalid Name"),
			*FString::FromInt(static_cast<int32>(reinterpret_cast<std::uintptr_t>(ConnectionSocket))),
			*FString(ConnectionSocket != NULL ? "True" : "False"));*/
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
			else if (fs.Contains("You are in a maze of twisty passages, all alike."))
			{
				GetChannelName(AccessToken);
			}
			else if (fs.Contains(":tmi.twitch.tv NOTICE * :Login unsuccessful") ||
				fs.Contains(":tmi.twitch.tv NOTICE * :Login authentication failed") ||
				fs.Contains(":tmi.twitch.tv NOTICE * :Improperly formatted auth"))
			{
				OnConnectedToTwitchStatus.Broadcast(ChannelToJoin, true);
			}
		}
		else if (parts.Num() == 1)
		{
			if (meta.Num() == 3 && meta[1] == TEXT("JOIN"))
			{
				FString ExpectedJoin = FString("#").Append(ChannelToJoin);
				if (meta[2] == *ExpectedJoin)
				{
					OnConnectedToTwitchStatus.Broadcast(ChannelToJoin, true);
				}
			}
		}
		else if (fs.Contains(":tmi.twitch.tv NOTICE * :Login unsuccessful") ||
			fs.Contains(":tmi.twitch.tv NOTICE * :Login authentication failed") ||
			fs.Contains(":tmi.twitch.tv NOTICE * :Improperly formatted auth"))
		{
			OnConnectedToTwitchStatus.Broadcast(ChannelToJoin, false);
		}
	}
}


void AChatGameModeBase::ReceivedChatMessage(FString UserName, FString message)
{
	UE_LOG(LogTemp, Warning, TEXT("%s: %s"), *UserName, *message);
	OnNewChatMessage.Broadcast(UserName, message);
}

void AChatGameModeBase::SendLogin(const FString& UserAccessToken)
{
	FResolveInfo* ResolveInfo = ISocketSubsystem::Get()->GetHostByName("irc.chat.twitch.tv");
	while (!ResolveInfo->IsComplete());
	if (ResolveInfo->GetErrorCode() != 0)
	{
		UE_LOG(LogTemp, Warning, TEXT("Couldn't resolve hostname."));
		OnConnectedToTwitchStatus.Broadcast("", false);
		delete ResolveInfo;
		return;
	}

	const FInternetAddr& Addr = ResolveInfo->GetResolvedAddress();
	uint32 OutIP = 0;
	Addr.GetIp(OutIP);
	int32 port = 6667;

	TSharedRef<FInternetAddr> addr = ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->CreateInternetAddr();
	addr->SetIp(OutIP);
	addr->SetPort(port);

	ConnectionSocket = ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->CreateSocket(NAME_Stream, TEXT("default"), false);
	UE_LOG(LogTemp, Display, TEXT("This Object: %s (Is Valid = %s, Class = %s), Connection Socket: %s, Is Valid Socket: %s"),
		*FString::FromInt(IsValid(this) ? static_cast<int32>(this->GetUniqueID()) : -1),
		*FString(IsValid(this) ? "True" : "False"),
		*FString(IsValid(this) ? this->GetClass()->GetName() : "Invalid Name"),
		*FString::FromInt(static_cast<int32>(reinterpret_cast<std::uintptr_t>(ConnectionSocket))),
		*FString(ConnectionSocket != NULL ? "True" : "False"));

	bool connected = ConnectionSocket->Connect(*addr);
	if (!connected)
	{
		UE_LOG(LogTemp, Warning, TEXT("Failed to connect."));
		if (ConnectionSocket)
		{
			ConnectionSocket->Close();
		}
		OnConnectedToTwitchStatus.Broadcast("", false);
		delete ResolveInfo;
		return;
	}

	FString PassStr = FString("PASS oauth:").Append(*UserAccessToken);
	SendString(*PassStr);
	SendString(TEXT("NICK guesstogethergame"));
	delete ResolveInfo;
}

bool AChatGameModeBase::SendString(FString msg)
{
	FString serialized = msg + TEXT("\r\n");
	TCHAR * serializedChar = serialized.GetCharArray().GetData();
	int32 size = FCString::Strlen(serializedChar);
	int32 sent = 0;

	if (ConnectionSocket == NULL)
	{
		UE_LOG(LogTemp, Warning, TEXT("AChatGameModeBase::SendString - Connection Socket Is Uninitilized."));
		OnConnectedToTwitchStatus.Broadcast("", false);
		return false;
	}
	else if (!ConnectionSocket->Send((uint8*)TCHAR_TO_UTF8(serializedChar), size, sent))
	{
		UE_LOG(LogTemp, Warning, TEXT("Failed to send message '%s'."), serializedChar);
		OnConnectedToTwitchStatus.Broadcast("", false);
		return false;
	}
	else
	{
		UE_LOG(LogTemp, Warning, TEXT("Sent message '%s'."), serializedChar);
	}
	return true;
}
