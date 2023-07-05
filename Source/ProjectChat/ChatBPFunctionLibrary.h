// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "ChatBPFunctionLibrary.generated.h"

/**
 * 
 */
UCLASS()
class PROJECTCHAT_API UChatBPFunctionLibrary : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

		UFUNCTION(BlueprintCallable)
		static bool IsFirstCharacterWhitespace(const FString& String);

	UFUNCTION(BlueprintCallable)
		static FString SanitizeNameSubmission(const FString& InputString);
	
};
