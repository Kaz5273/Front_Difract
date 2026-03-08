import { useState, useCallback } from 'react';
import { eventService, EventFilters } from '@/services/events/events.service';
import { Event } from '@/services/api/types';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return { events, isLoading, error, fetchEvents, fetchUpcoming };
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
      setEvent(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Impossible de charger l'événement");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { event, isLoading, error, fetchEvent };
}
