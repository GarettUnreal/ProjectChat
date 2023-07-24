// Fill out your copyright notice in the Description page of Project Settings.


#include "ChatBPFunctionLibrary.h"
#include "HAL/FileManagerGeneric.h"
//#include "IPlatformFilePak.h"
//#include "AssetRegistryModule.h"
#include "HAL/PlatformFilemanager.h"
#include "IPlatformFilePak.h"
#include "AssetRegistry/AssetRegistryModule.h"
#include "AttributionJSONAsset.h"

bool UChatBPFunctionLibrary::IsFirstCharacterWhitespace(const FString& String)
{
	return !String.IsEmpty() && FText::IsWhitespace(String[0]);
}

FString UChatBPFunctionLibrary::SanitizeNameSubmission(const FString& InputString)
{
	FString TrimmedInput = InputString.TrimStartAndEnd();
	FString Result = "";

	int32 WhiteSpaceCount = 0;
	for (int32 index = 0; index < TrimmedInput.Len(); index++)
	{
		if (FText::IsWhitespace(TrimmedInput[index]))
		{
			if (WhiteSpaceCount == 0)
			{
				Result += TrimmedInput[index];
			}
			WhiteSpaceCount++;
		}
		else
		{
			Result += TrimmedInput[index];
			WhiteSpaceCount = 0;
		}
	}

	return Result;
}

TArray<FString> UChatBPFunctionLibrary::GetFolderFileNames(const FString& Folder, const FString& Extension)
{
	TArray<FString> Result;

	if (FPaths::DirectoryExists(Folder))
	{
		UE_LOG(LogTemp, Warning, TEXT("Search Folder = %s, Search Extension = %s"), *Folder, *Extension);
		FFileManagerGeneric::Get().FindFiles(Result, *Folder, *Extension);
	}

	return Result;
}

TArray<FString> UChatBPFunctionLibrary::GetChildDirectories(const FString& Folder)
{
	TArray<FString> Result;

	if (FPaths::DirectoryExists(Folder))
	{
		FFileManagerGeneric::Get().FindFilesRecursive(Result, *Folder, TEXT("*"), false, true, true);
	}

	return Result;
}

UTexture2D* UChatBPFunctionLibrary::LoadTexture(const FString& Filename)
{
	return LoadObject<UTexture2D>(NULL, *Filename, NULL, LOAD_None, NULL);
}

TArray<UObject*> UChatBPFunctionLibrary::DynamicLoadContentFromPath(FString PathFromContentFolder, UClass* AssetClass, TArray<FString>& FilePaths)
{
	TArray<UObject*> Array;
	
	FString RootFolderFullPath = FPaths::ConvertRelativePathToFull(FPaths::ProjectContentDir() + PathFromContentFolder + "/");
	//Print("RootFolderPath = " + RootFolderFullPath);

	//FPaths::NormalizeDirectoryName(RootFolderFullPath);
	//Print("Normalized RootFolderPath = " + RootFolderFullPath);

	IFileManager& FileManager = IFileManager::Get();

	TArray<FString> Files;

	FString Ext;

	if (!Ext.Contains(TEXT("*")))
	{
		if (Ext == "")
		{
			Ext = "*.*";
		}
		else
		{
			Ext = (Ext.Left(1) == ".") ? "*" + Ext : "*." + Ext;
		}
	}

	FileManager.FindFiles(Files, *(RootFolderFullPath + Ext), true, false);

	for (int32 i = 0; i < Files.Num(); i++)
	{
		FString Path;
		
		Path = AssetClass->GetFName().ToString() + "'/Game/" + PathFromContentFolder + "/" + Files[i].LeftChop(7) + "." + Files[i].LeftChop(7) + "'";
		UObject* LoadedObj = StaticLoadObject(AssetClass, NULL, *Path);
		FilePaths.Add(Files[i]);
		Array.Add(LoadedObj);
	}

	return Array;
}

FString UChatBPFunctionLibrary::CamelToDisplay(const FString& CamelCase)
{
	FString Result;

	for (int index = 0; index < CamelCase.Len(); index++)
	{
		if (TChar<TCHAR>::IsUpper(CamelCase[index]))
		{
			Result.AppendChar(TCHAR(' '));
		}
		Result.AppendChar(CamelCase[index]);
	}

	return Result;
}

FString UChatBPFunctionLibrary::DisplayToCamel(const FString& CamelCase)
{
	FString Result;

	for (int index = 0; index < CamelCase.Len(); index++)
	{
		if (CamelCase[index] != TCHAR(' '))
		{
			Result.AppendChar(CamelCase[index]);
		}
	}

	return Result;
}

TArray<FString> UChatBPFunctionLibrary::ReadSubfolders(const FString& Folder)
{
	FString YourFolderPath = Folder;
	// Get a reference to the AssetRegistry module
	FAssetRegistryModule& AssetRegistryModule = FModuleManager::LoadModuleChecked<FAssetRegistryModule>("AssetRegistry");

	// Get the Asset Registry interface
	IAssetRegistry& AssetRegistry = AssetRegistryModule.Get();

	TSet<FString> Subdirectories;

	// Create an asset query filter
	FARFilter Filter;
	Filter.PackagePaths.Add(FName(*YourFolderPath));
	Filter.bRecursivePaths = true;
	Filter.ClassNames.Add(UTexture2D::StaticClass()->GetFName());

	// Query assets using the filter
	TArray<FAssetData> AssetData;
	AssetRegistry.GetAssets(Filter, AssetData);

	for (const FAssetData& Data : AssetData)
	{
		FString AssetPath = Data.PackagePath.ToString();

		// Check if the asset is within our desired folder
		if (AssetPath.StartsWith(YourFolderPath))
		{
			FString RelativePath = AssetPath.RightChop(YourFolderPath.Len());
			TArray<FString> PathParts;
			RelativePath.ParseIntoArray(PathParts, TEXT("/"), true);

			if (PathParts.Num() > 0)
			{
				Subdirectories.Add(PathParts[0]);
			}
		}
	}

	return Subdirectories.Array();
}

TArray<FJSONAssetInfo> UChatBPFunctionLibrary::FindCategoryInfo()
{
	// Get a reference to the AssetRegistry module
	FAssetRegistryModule& AssetRegistryModule = FModuleManager::LoadModuleChecked<FAssetRegistryModule>("AssetRegistry");

	// Get the Asset Registry interface
	IAssetRegistry& AssetRegistry = AssetRegistryModule.Get();

	TArray<FJSONAssetInfo> AssetInfoArray;

	// Create an asset query filter
	FARFilter Filter;
	Filter.bRecursivePaths = true;
	Filter.ClassNames.Add(UAttributionJSONAsset::StaticClass()->GetFName());

	// Query assets using the filter
	TArray<FAssetData> AssetData;
	AssetRegistry.GetAssets(Filter, AssetData);

	for (const FAssetData& Data : AssetData)
	{
		FJSONAssetInfo Info;

		Info.AssetReferencePath = Data.GetSoftObjectPath().ToString();

		FString AssetPath = Data.PackagePath.ToString();
		Info.ContainingFolderName = FPaths::GetCleanFilename(AssetPath); // This gets the last folder (or filename) from the path

		AssetInfoArray.Add(Info);
	}

	return AssetInfoArray;
}

FString UChatBPFunctionLibrary::GetJSONDataFromAssetPath(const FString& AssetPath)
{
	// Load the asset using its path
	UObject* LoadedObject = StaticLoadObject(UAttributionJSONAsset::StaticClass(), nullptr, *AssetPath);

	if (LoadedObject != NULL)
	{
		// Cast the loaded object to your UYourJSONAsset type
		UAttributionJSONAsset* JSONAsset = Cast<UAttributionJSONAsset>(LoadedObject);

		if (JSONAsset != NULL)
		{
			// Access the desired data from the asset
			return JSONAsset->JSONObject;
		}
	}

	return ""; // Return empty string if asset wasn't loaded or cast failed
}

TArray<UTexture2D*> UChatBPFunctionLibrary::LoadAdjacentTexturesFromAssetPath(const FString& AssetPath)
{
	TArray<UTexture2D*> LoadedTextures;

	// Extract the directory from the asset path
	FString AssetDirectory = FPaths::GetPath(AssetPath);

	// Get a reference to the AssetRegistry module
	FAssetRegistryModule& AssetRegistryModule = FModuleManager::LoadModuleChecked<FAssetRegistryModule>("AssetRegistry");

	// Get the Asset Registry interface
	IAssetRegistry& AssetRegistry = AssetRegistryModule.Get();

	// Create an asset query filter for textures in the specified directory
	FARFilter Filter;
	Filter.PackagePaths.Add(*AssetDirectory);
	Filter.ClassNames.Add(UTexture2D::StaticClass()->GetFName());

	// Query assets using the filter
	TArray<FAssetData> AssetData;
	AssetRegistry.GetAssets(Filter, AssetData);

	// Load each found texture and add it to the result array
	for (const FAssetData& Data : AssetData)
	{
		UTexture2D* Texture = Cast<UTexture2D>(Data.GetAsset());
		if (Texture)
		{
			LoadedTextures.Add(Texture);
		}
	}

	return LoadedTextures;
}

FString UChatBPFunctionLibrary::GetBaseFileNameOfTexture(UTexture2D* Texture)
{
	if (Texture)
	{
		FString FullPath = Texture->GetPathName();
		return FPaths::GetBaseFilename(FullPath);
	}
	return TEXT("");
}
