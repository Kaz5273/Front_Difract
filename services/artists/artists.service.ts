import { apiClient } from '../api/client';
import { User, Artist } from '../api/types';

export const artistsService = {
  /**
   * Récupérer tous les artistes (users avec role ARTIST)
   */
  getAll: async (): Promise<Artist[]> => {
    const response = await apiClient.get<Artist[]>('/api/artists');
    return response.data;
  },

  /**
   * Récupérer un artiste par son ID
   */
  getById: async (id: number): Promise<Artist> => {
    const response = await apiClient.get<Artist>(`/api/artists/${id}`);
    return response.data;
  },

  /**
   * Récupérer les artistes les plus votés
   */
  getTopArtists: async (limit: number = 10): Promise<Artist[]> => {
    const response = await apiClient.get<Artist[]>('/api/artists/top', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Voter pour un artiste
   */
  vote: async (artistId: number): Promise<void> => {
    await apiClient.post(`/api/artists/${artistId}/vote`);
  },

  /**
   * Retirer son vote d'un artiste
   */
  unvote: async (artistId: number): Promise<void> => {
    await apiClient.delete(`/api/artists/${artistId}/vote`);
  },

  /**
   * Vérifier si l'utilisateur a voté pour cet artiste
   */
  hasVoted: async (artistId: number): Promise<boolean> => {
    const response = await apiClient.get<{ has_voted: boolean }>(
      `/api/artists/${artistId}/has-voted`
    );
    return response.data.has_voted;
  },
};

export default artistsService;