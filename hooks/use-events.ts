import { useState, useCallback } from 'react';
import { eventService, EventFilters } from '@/services/events/events.service';
import { artistsService } from '@/services/artists/artists.service';
import { Event, Artist } from '@/services/api/types';
import { getMediaUrl } from '@/services/api/client';
import { haversineKm } from '@/utils/distance';

type Coords = { latitude: number; longitude: number };

function enrichAndSort(events: Event[], coords?: Coords): Event[] {
  if (!coords) return events;
  const enriched = events.map((e) => {
    if (e.distance_km != null) return e;
    if (e.latitude != null && e.longitude != null) {
      return { ...e, distance_km: haversineKm(coords.latitude, coords.longitude, e.latitude, e.longitude) };
    }
    return e;
  });
  return enriched.sort((a, b) => {
    if (a.distance_km == null && b.distance_km == null) return 0;
    if (a.distance_km == null) return 1;
    if (b.distance_km == null) return -1;
    return a.distance_km - b.distance_km;
  });
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPastLoading, setIsPastLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pastError, setPastError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (filters?: EventFilters, coords?: Coords) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventService.getAll(filters);
      setEvents(enrichAndSort(data, coords));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Impossible de charger les événements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUpcoming = useCallback(async (limit?: number, coords?: Coords) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventService.getUpcoming(limit);
      setEvents(enrichAndSort(data, coords));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Impossible de charger les événements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPast = useCallback(async (coords?: Coords) => {
    setIsPastLoading(true);
    setPastError(null);
    try {
      const data = await eventService.getPast();
      setPastEvents(enrichAndSort(data, coords));
    } catch (e: any) {
      setPastError(e?.response?.data?.message || 'Impossible de charger les événements passés');
    } finally {
      setIsPastLoading(false);
    }
  }, []);

  return { events, pastEvents, isLoading, isPastLoading, error, pastError, fetchEvents, fetchUpcoming, fetchPast };
}

export function useEventDetail(id: number) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventService.getById(id);

      // Compute event-specific vote counts from event.votes (not artist.votes_count which is global)
      const votesByArtist = (data.votes ?? []).reduce<Record<number, number>>((acc, v) => {
        acc[v.artist_id] = (acc[v.artist_id] ?? 0) + 1;
        return acc;
      }, {});

      // Enrich artists with media from detail endpoint (event API doesn't include media)
      if (data.artists && data.artists.length > 0) {
        const details = await Promise.allSettled(
          data.artists.map((a) => artistsService.getDetail(a.id))
        );
        data.artists = data.artists.map((artist, i) => {
          const result = details[i];
          if (result.status === 'fulfilled') {
            const detail = result.value;
            const profileMedia = detail.media?.find((m) => m.role === 'PROFILE' && m.is_primary);
            const detailStyles = [
              ...(detail.primary_style ? [detail.primary_style] : []),
              ...(detail.secondary_styles || []),
            ];
            return {
              ...artist,
              votes_count: votesByArtist[artist.id] ?? 0,
              media: detail.media,
              media_url: profileMedia ? getMediaUrl(profileMedia) || artist.media_url : artist.media_url,
              styles: artist.styles?.length ? artist.styles : detailStyles,
            } as Artist;
          }
          return { ...artist, votes_count: votesByArtist[artist.id] ?? 0 };
        });
      }

      setEvent(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Impossible de charger l'événement");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { event, isLoading, error, fetchEvent };
}
