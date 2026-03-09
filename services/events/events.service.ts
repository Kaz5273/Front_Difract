import { apiClient } from '../api/client';
import { Event, Artist } from '../api/types';
import { ENDPOINTS } from '../api/endpoints';

export interface EventFilters {
  q?: string;
  style_id?: number;
  date?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'DONE';
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface TicketPrice {
  sale_available: boolean;
  reason: string | null;
  sale_opens_at: string | null;
  tier: 'early_access' | 'standard' | 'last_minute' | null;
  price: number | null;
  capacity: number | null;
  sold: number;
  available: number;
  tier_stock?: number | null;
  tier_sold?: number | null;
  tier_available?: number | null;
}

export const eventService = {
  getAll: async (filters?: EventFilters): Promise<Event[]> => {
    const response = await apiClient.get<Event[]>(ENDPOINTS.EVENTS, { params: filters });
    return response.data;
  },

  getUpcoming: async (limit?: number): Promise<Event[]> => {
    const response = await apiClient.get<Event[]>(ENDPOINTS.EVENTS_UPCOMING, {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },

  getPast: async (limit?: number): Promise<Event[]> => {
    const response = await apiClient.get<Event[]>(ENDPOINTS.EVENTS_PAST, {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },

  getById: async (id: number): Promise<Event> => {
    const response = await apiClient.get<Event>(ENDPOINTS.EVENT_BY_ID(id));
    return response.data;
  },

  getEventArtists: async (eventId: number): Promise<Artist[]> => {
    const response = await apiClient.get<Artist[]>(ENDPOINTS.EVENT_ARTISTS(eventId));
    return response.data;
  },

  getTicketPrice: async (eventId: number): Promise<TicketPrice> => {
    const response = await apiClient.get<TicketPrice>(ENDPOINTS.EVENT_TICKET_PRICE(eventId));
    return response.data;
  },

  checkoutTicket: async (eventId: number, hasInsurance: boolean): Promise<{ checkout_url: string; tier: string; price: number }> => {
    const response = await apiClient.post(ENDPOINTS.EVENT_TICKET_CHECKOUT(eventId), { has_insurance: hasInsurance });
    return response.data;
  },

  registerArtist: async (eventId: number): Promise<void> => {
    await apiClient.post(ENDPOINTS.ARTISTS_REGISTER, { event_id: eventId });
  },

  unregisterArtist: async (eventId: number): Promise<void> => {
    await apiClient.post(ENDPOINTS.ARTISTS_UNREGISTER, { event_id: eventId });
  },
};

export default eventService;