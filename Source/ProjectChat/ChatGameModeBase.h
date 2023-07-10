// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "Sockets.h"
#include "Http.h"
#include "ChatGameModeBase.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnNewChatMessage, FString, Username, FString, Message);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnJoinStatus, bool, bJoinSuccesful);

/**
 * 
 */
UCLASS()
class PROJECTCHAT_API AChatGameModeBase : public AGameModeBase
{
	GENERATED_BODY()

public:
	virtual void BeginPlay() override;

	UPROPERTY(BlueprintAssignable)
	FOnNewChatMessage OnNewChatMessage;

	UPROPERTY(BlueprintAssignable)
	FOnJoinStatus OnJoinStatus;

	UFUNCTION(BlueprintCallable)
	bool TryJoinChannel(const FString& Channel);

private:
	FSocket* ListenerSocket;
	FSocket* ConnectionSocket;
	FTimerHandle timerHandle;

	FString ChannelToJoin;

	void SocketListener();

	void SendLogin(const FString& AccessToken);

	bool SendString(FString msg);

	void ParseMessage(FString msg);

	void ReceivedChatMessage(FString UserName, FString message);

	void OnHTTPRespnose(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bConnectedSuccess);
	
};
