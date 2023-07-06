// Fill out your copyright notice in the Description page of Project Settings.


#include "ChatBPFunctionLibrary.h"
#include "HAL/FileManagerGeneric.h"

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
