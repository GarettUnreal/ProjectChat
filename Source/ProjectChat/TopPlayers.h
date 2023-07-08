// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "UObject/NoExportTypes.h"
#include "TopPlayers.generated.h"

USTRUCT(BlueprintType)
struct FPlayerScore
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FString Username;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	int32 Score;
};

/**
 * 
 */
UCLASS(Blueprintable, BlueprintType)
class PROJECTCHAT_API UTopPlayers : public UObject
{
	GENERATED_BODY()

public:
	UTopPlayers();

	UFUNCTION(BlueprintCallable)
	bool TryAddNewPlayer(const FPlayerScore& NewPlayer);

	UFUNCTION(BlueprintCallable)
	TArray<FPlayerScore> GetTopPlayers() const;

	UFUNCTION(BlueprintCallable)
		bool IsDirty() const;

	UFUNCTION(BlueprintCallable)
	void UnDirty();

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	int32 MaxTopPlayers;
	
private:

	TArray<FPlayerScore> TopPerformers;

	int32 MinTopScore;

	bool _IsDirty;
};
