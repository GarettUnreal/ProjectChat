// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "ChatBPFunctionLibrary.generated.h"

USTRUCT(BlueprintType)
struct FJSONAssetInfo
{
	GENERATED_BODY()

	// A path reference to the UYourJSONAsset asset
	UPROPERTY(BlueprintReadOnly)
	FString AssetReferencePath;

	// Name of the UYourJSONAsset containing folder
	UPROPERTY(BlueprintReadOnly)
	FString ContainingFolderName;
};

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

	UFUNCTION(BlueprintCallable)
		static TArray<FString> GetFolderFileNames(const FString& Folder, const FString& Extension);

	UFUNCTION(BlueprintCallable)
		static TArray<FString> GetChildDirectories(const FString& Folder);

	UFUNCTION(BlueprintCallable)
		static UTexture2D* LoadTexture(const FString& Filename);

	UFUNCTION(BlueprintCallable, Category = "Sweet|Utilities")
		static TArray<UObject*> DynamicLoadContentFromPath(FString PathFromContentFolder, UClass* AssetClass, TArray<FString>& FilePaths);

	UFUNCTION(BlueprintCallable)
		static FString CamelToDisplay(const FString& CamelCase);

	UFUNCTION(BlueprintCallable)
		static FString DisplayToCamel(const FString& CamelCase);

	UFUNCTION(BlueprintCallable)
		static TArray<FString> ReadSubfolders(const FString& Folder);

	UFUNCTION(BlueprintCallable)
		static TArray<FJSONAssetInfo> FindCategoryInfo();

	UFUNCTION(BlueprintCallable)
		static FString GetJSONDataFromAssetPath(const FString& AssetPath);

	UFUNCTION(BlueprintCallable)
	static TArray<UTexture2D*> LoadAdjacentTexturesFromAssetPath(const FString& AssetPath);

	UFUNCTION(BlueprintCallable)
	static FString GetBaseFileNameOfTexture(UTexture2D* Texture);
};
