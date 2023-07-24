// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "AttributionJSONAsset.generated.h"

/**
 * 
 */
UCLASS()
class PROJECTCHAT_API UAttributionJSONAsset : public UDataAsset
{
    GENERATED_BODY()

public:
    // Add members here that represent the data in your JSON file
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Data")
        FString JSONObject;
};
