import { useState, useCallback } from 'react';
import { votesService } from '@/services/votes/votes.service';
import type { Vote, VoteEvent, VoteArtist } from '@/services/api/types';

export interface GroupedVoteEvent {
  event: VoteEvent;
  artists: (VoteArtist & { voteId: number; votedAt: string })[];
}

export function useVotes() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyVotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await votesService.getMyVotes();
      setVotes(data);
    } catch (err: any) {
      console.error('Failed to fetch votes:', err);
      setError(err?.message || 'Erreur lors du chargement des votes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Grouper les votes par événement
  const groupedByEvent: GroupedVoteEvent[] = votes.reduce<GroupedVoteEvent[]>((acc, vote) => {
    if (!vote.event) return acc;

    let group = acc.find((g) => g.event.id === vote.event_id);
    if (!group) {
      group = { event: vote.event, artists: [] };
      acc.push(group);
    }

    if (vote.artist) {
      group.artists.push({
        ...vote.artist,
        voteId: vote.id,
        votedAt: vote.created_at,
      });
    }

    return acc;
  }, []);

  return {
    votes,
    groupedByEvent,
    isLoading,
    error,
    fetchMyVotes,
  };
}

export default useVotes;
