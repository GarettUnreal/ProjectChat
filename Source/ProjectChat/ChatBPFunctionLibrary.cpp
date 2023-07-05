// Fill out your copyright notice in the Description page of Project Settings.


#include "ChatBPFunctionLibrary.h"

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
