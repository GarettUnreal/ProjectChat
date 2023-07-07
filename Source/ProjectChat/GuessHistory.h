// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "UObject/NoExportTypes.h"
#include "GuessHistory.generated.h"

/**
 * 
 */
UCLASS(Blueprintable, BlueprintType)
class PROJECTCHAT_API UGuessHistory : public UObject
{
	GENERATED_BODY()

	UGuessHistory();

public:

	UFUNCTION(BlueprintCallable)
		void AddRecord(const FString& Guess);

	UFUNCTION(BlueprintCallable)
		bool GetGuessAt(int32 NumGuessesAgo, FString& Guess);

private:

	TArray<FString> History;

	int32 StartIndex;
	int32 MaxHistory;
	int32 CurrentHistorySize;
	
};
