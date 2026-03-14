import { useState, useCallback } from 'react';
import { votesService } from '@/services/votes/votes.service';
import { eventService } from '@/services/events/events.service';
import { artistsService } from '@/services/artists/artists.service';
import { getMediaUrl } from '@/services/api/client';
import type { Vote, VoteEvent, Event, Artist } from '@/services/api/types';

export interface GroupedVoteEvent {
  event: VoteEvent;
  votedArtistId: number;
  artists: (Artist & { isVoted: boolean })[];
}

function isVoteEventActive(event: VoteEvent): boolean {
  if (event.is_voting_open === false) return false;
  if (event.voting_end_date) {
    return new Date(event.voting_end_date) > new Date();
  }
  if (event.voting_time_remaining != null) {
    return event.voting_time_remaining > 0;
  }
  return event.status === 'PUBLISHED';
}

export function useVotes(filter: 'active' | 'done' = 'active') {
  const [groupedByEvent, setGroupedByEvent] = useState<GroupedVoteEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyVotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const votes: Vote[] = await votesService.getMyVotes();

      // Grouper par événement (dédoublonner)
      const byEvent = votes.reduce<{ event: VoteEvent; votedArtistId: number }[]>((acc, vote) => {
        if (!vote.event || !vote.artist) return acc;
        if (!acc.find((g) => g.event.id === vote.event_id)) {
          acc.push({ event: vote.event, votedArtistId: vote.artist_id });
        }
        return acc;
      }, []);

      // Filtrer selon le tab actif avant les appels lourds
      // "active" = PUBLISHED ET voting encore ouvert (voting_end_date future)
      // "done"   = DONE OU voting fermé (is_voting_open=false ou voting_end_date passée)
      const filtered = byEvent.filter(({ event }) =>
        filter === 'active'
          ? event.status === 'PUBLISHED' && isVoteEventActive(event)
          : event.status === 'DONE' || !isVoteEventActive(event)
      );

      // Pour chaque event, utiliser GET /events/{id} puis enrichir les artistes
      const groups = await Promise.all(
        filtered.map(async ({ event, votedArtistId }) => {
          try {
            const fullEvent: Event = await eventService.getById(event.id);
            let artists = (fullEvent.artists ?? []) as Artist[];

            // Compute event-specific vote counts from event.votes (not global votes_count)
            const votesByArtist = (fullEvent.votes ?? []).reduce<Record<number, number>>((acc, v) => {
              acc[v.artist_id] = (acc[v.artist_id] ?? 0) + 1;
              return acc;
            }, {});

            // Enrichir chaque artiste avec ses médias
            if (artists.length > 0) {
              const details = await Promise.allSettled(
                artists.map((a) => artistsService.getDetail(a.id))
              );
              artists = artists.map((artist, i) => {
                const result = details[i];
                if (result.status === 'fulfilled') {
                  const detail = result.value;
                  const profileMedia = detail.media?.find((m) => m.role === 'PROFILE' && m.is_primary);
                  return {
                    ...artist,
                    votes_count: votesByArtist[artist.id] ?? 0,
                    media: detail.media,
                    media_url: profileMedia ? getMediaUrl(profileMedia) || artist.media_url : artist.media_url,
                    styles: artist.styles?.length ? artist.styles : [
                      ...(detail.primary_style ? [detail.primary_style] : []),
                      ...(detail.secondary_styles || []),
                    ],
                  } as Artist;
                }
                return { ...artist, votes_count: votesByArtist[artist.id] ?? 0 };
              });
            }

            return {
              event: {
                ...event,
                voting_end_date: fullEvent.voting_end_date,
                voting_time_remaining: fullEvent.voting_time_remaining,
                is_voting_open: fullEvent.is_voting_open,
                status: fullEvent.status,
                latitude: fullEvent.latitude,
                longitude: fullEvent.longitude,
              },
              votedArtistId,
              artists: artists.map((a) => ({ ...a, isVoted: a.id === votedArtistId })),
            };
          } catch {
            return { event, votedArtistId, artists: [] };
          }
        })
      );

      setGroupedByEvent(groups);
    } catch (err: any) {
      console.error('Failed to fetch votes:', err);
      setError(err?.message || 'Erreur lors du chargement des votes');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  return {
    groupedByEvent,
    isLoading,
    error,
    fetchMyVotes,
  };
}

export default useVotes;
