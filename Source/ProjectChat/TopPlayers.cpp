// Fill out your copyright notice in the Description page of Project Settings.


#include "TopPlayers.h"

UTopPlayers::UTopPlayers() :
	MaxTopPlayers(10),
	MinTopScore(0),
	_IsDirty(false)
{}

bool UTopPlayers::TryAddNewPlayer(const FPlayerScore& NewPlayer)
{
	if (NewPlayer.Score <= MinTopScore || MaxTopPlayers <= 0)
	{
		return false;
	}

	// Remove incoming players old score.
	for (int32 index = 0; index < TopPerformers.Num(); index++)
	{
		if (NewPlayer.Username == TopPerformers[index].Username)
		{
			TopPerformers.RemoveAt(index);
			break;
		}
	}

	_IsDirty = true;
	if (TopPerformers.IsEmpty())
	{
		TopPerformers.Add(NewPlayer);
		MinTopScore = NewPlayer.Score;
	}
	else
	{
		for (int32 index = 0; index < TopPerformers.Num(); index++)
		{
			if (NewPlayer.Score > TopPerformers[index].Score)
			{
				TopPerformers.Insert(NewPlayer, index);
				break;
			}
		}

		if (TopPerformers.Num() > MaxTopPlayers)
		{
			TopPerformers.RemoveAt(TopPerformers.Num() - 1);
		}

		MinTopScore = TopPerformers[TopPerformers.Num() - 1].Score;
	}
	return true;
}

TArray<FPlayerScore> UTopPlayers::GetTopPlayers() const
{
	return TopPerformers;
	/*TArray<FPlayerScore> Result;
	for (int32 index = 0; index < TopPerformers.Num(); index++)
	{
		Result.Add(TopPerformers[index]);
	}
	return Result;*/
}

bool UTopPlayers::IsDirty() const
{
	return _IsDirty;
}

void UTopPlayers::UnDirty()
{
	_IsDirty = false;
}
