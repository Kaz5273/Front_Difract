import { apiClient } from '../api/client';
import { Event, Artist } from '../api/types';

export const eventService = {
  /**
   * Récupérer tous les événements
   */
  getAll: async (): Promise<Event[]> => {
    const response = await apiClient.get<Event[]>('/api/events');
    return response.data;
  },

  /**
   * Récupérer un événement par ID
   */
  getById: async (id: number): Promise<Event> => {
    const response = await apiClient.get<Event>(`/api/events/${id}`);
    return response.data;
  },

  /**
   * Créer un événement (admin/artiste)
   */
  create: async (event: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'artists'>): Promise<Event> => {
    const response = await apiClient.post<Event>('/api/events', event);
    return response.data;
  },

  /**
   * Mettre à jour un événement
   */
  update: async (
    id: number,
    event: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at' | 'artists'>>
  ): Promise<Event> => {
    const response = await apiClient.put<Event>(`/api/events/${id}`, event);
    return response.data;
  },

  /**
   * Supprimer un événement
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/events/${id}`);
  },

  /**
   * Récupérer les événements à venir
   */
  getUpcoming: async (): Promise<Event[]> => {
    const response = await apiClient.get<Event[]>('/api/events/upcoming');
    return response.data;
  },

  /**
   * Récupérer les artistes d'un événement
   */
  getEventArtists: async (eventId: number): Promise<Artist[]> => {
    const response = await apiClient.get<Artist[]>(`/api/events/${eventId}/artists`);
    return response.data;
  },

  /**
   * Associer un artiste à un événement
   */
  addArtist: async (eventId: number, artistId: number): Promise<void> => {
    await apiClient.post(`/api/events/${eventId}/artists`, { artist_id: artistId });
  },

  /**
   * Retirer un artiste d'un événement
   */
  removeArtist: async (eventId: number, artistId: number): Promise<void> => {
    await apiClient.delete(`/api/events/${eventId}/artists/${artistId}`);
  },
};

export default eventService;