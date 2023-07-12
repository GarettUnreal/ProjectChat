// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameMode.h"
#include "Sockets.h"
#include "Http.h"

#include "HttpPath.h"
#include "IHttpRouter.h"
#include "HttpServerHttpVersion.h"
#include "HttpServerModule.h"
#include "HttpServerResponse.h"

#include "ChatGameModeBase.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnNewChatMessage, FString, Username, FString, Message);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnConnectedToTwitchStatus, FString, ConnectedChannel, bool, bIsSuccessful);

/**
 * 
 */
UCLASS()
class PROJECTCHAT_API AChatGameModeBase : public AGameMode
{
	GENERATED_BODY()
public:
	AChatGameModeBase();
	~AChatGameModeBase();

	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	UPROPERTY(BlueprintAssignable)
	FOnNewChatMessage OnNewChatMessage;

	UPROPERTY(BlueprintAssignable)
	FOnConnectedToTwitchStatus OnConnectedToTwitchStatus;

	static TObjectPtr<UWorld> World;

private:
	// HTTP Server
	//bool(const FHttpServerRequest& Request, const FHttpResultCallback& OnComplete)
	bool RequestGETCallback(const FHttpServerRequest& Request, const FHttpResultCallback& OnComplete);
	//bool RequestGETAuthTokens(const FHttpServerRequest& Request, const FHttpResultCallback& OnComplete);
	void RequestPrint(const FHttpServerRequest& Request, bool PrintBody = true);
	TSharedPtr<IHttpRouter> HttpRouter;

	// HTTP Request and Response
	bool AuthorizeApp(const FString& Code);
	void OnHTTPRespnose(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bConnectedSuccess);
	bool GetChannelName(const FString& Code);
	void OnGetChannelRespnose(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bConnectedSuccess);

	FSocket* ConnectionSocket;

	FString ChannelToJoin;
	FString AccessToken;

	void SocketListener();

	void SendLogin(const FString& UserAccessToken);
	bool TryJoinChannel(const FString& Channel);

	bool SendString(FString msg);

	void ParseMessage(FString msg);

	void ReceivedChatMessage(FString UserName, FString message);
	
};
