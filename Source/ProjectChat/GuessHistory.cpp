// Fill out your copyright notice in the Description page of Project Settings.


#include "GuessHistory.h"

UGuessHistory::UGuessHistory() :
	StartIndex(0),
	MaxHistory(100),
	CurrentHistorySize(0)
{
	History.SetNum(MaxHistory);
}

void UGuessHistory::AddRecord(const FString& Guess)
{
	int32 RequestedIndex = StartIndex + CurrentHistorySize;
	if (RequestedIndex >= MaxHistory)
	{
		RequestedIndex -= MaxHistory;
	}
	History[RequestedIndex] = Guess;
	if (CurrentHistorySize < MaxHistory)
	{
		CurrentHistorySize++;
	}
	else if (RequestedIndex == StartIndex)
	{
		StartIndex++;
		if (StartIndex == MaxHistory)
		{
			StartIndex = 0;
		}
	}
}

bool UGuessHistory::GetGuessAt(int32 NumGuessesAgo, FString& Guess)
{
	if ( NumGuessesAgo <= 0 || NumGuessesAgo > CurrentHistorySize)
	{
		return false;
	}

	int32 RequestedIndex = StartIndex + CurrentHistorySize - NumGuessesAgo;
	if (RequestedIndex >= MaxHistory)
	{
		RequestedIndex -= MaxHistory;
	}

	Guess = History[RequestedIndex];

	return true;
}
