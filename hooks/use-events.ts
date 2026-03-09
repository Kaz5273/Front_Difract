import { useState, useCallback } from 'react';
import { eventService, EventFilters } from '@/services/events/events.service';
import { artistsService } from '@/services/artists/artists.service';
import { Event, Artist } from '@/services/api/types';
import { getMediaUrl } from '@/services/api/client';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPastLoading, setIsPastLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pastError, setPastError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (filters?: EventFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventService.getAll(filters);
      setEvents(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Impossible de charger les événements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUpcoming = useCallback(async (limit?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventService.getUpcoming(limit);
      setEvents(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Impossible de charger les événements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPast = useCallback(async () => {
    setIsPastLoading(true);
    setPastError(null);
    try {
      const data = await eventService.getPast();
      console.log('[PastEvents] count:', data.length);
      if (data[0]) console.log('[PastEvents] first event keys:', Object.keys(data[0]));
      data.forEach(e => console.log('[PastEvent]', JSON.stringify({ id: e.id, title: e.title, image_url: e.image_url, cover: (e as any).cover, cover_url: (e as any).cover_url })));
      setPastEvents(data);
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
              media: detail.media,
              media_url: profileMedia ? getMediaUrl(profileMedia) || artist.media_url : artist.media_url,
              styles: artist.styles?.length ? artist.styles : detailStyles,
            } as Artist;
          }
          return artist;
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
