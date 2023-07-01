// Fill out your copyright notice in the Description page of Project Settings.


#include "ChatBPFunctionLibrary.h"

bool UChatBPFunctionLibrary::IsFirstCharacterWhitespace(const FString& String)
{
	return !String.IsEmpty() && FText::IsWhitespace(String[0]);
}