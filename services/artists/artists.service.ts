import { apiClient } from '../api/client';
import { Artist, Media, SocialLink } from '../api/types';
import { ENDPOINTS } from '../api/endpoints';

export interface ArtistDetail {
  id: number;
  name: string;
  bio: string | null;
  city: string | null;
  votes_count: number;
  distance_km?: number;
  styles: Array<{ id: number; name: string; pivot: { is_primary: boolean } }>;
  media?: Media[];
  social_links?: SocialLink[];
}

export const artistsService = {
  /**
   * Récupérer tous les artistes
   */
  getAll: async (): Promise<Artist[]> => {
    const response = await apiClient.get<Artist[]>(ENDPOINTS.ARTISTS);
    return response.data;
  },

  /**
   * Récupérer les artistes les plus votés
   */
  getTop: async (limit: number = 10): Promise<Artist[]> => {
    const response = await apiClient.get<Artist[]>(ENDPOINTS.ARTISTS_TOP, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Récupérer un artiste par son ID
   */
  getById: async (id: number): Promise<Artist> => {
    const response = await apiClient.get<Artist>(ENDPOINTS.ARTIST_BY_ID(id));
    return response.data;
  },

  /**
   * Récupérer les détails complets d'un artiste (public, avec styles/media/social_links)
   */
  getDetail: async (id: number, lat?: number, lng?: number): Promise<ArtistDetail> => {
    const response = await apiClient.get<ArtistDetail>(ENDPOINTS.ARTIST_DETAIL(id), {
      params: lat && lng ? { lat, lng } : undefined,
    });
    return response.data;
  },

  /**
   * Récupérer les événements d'un artiste
   */
  getEvents: async (id: number) => {
    const response = await apiClient.get(ENDPOINTS.ARTIST_EVENTS(id));
    return response.data;
  },
};

export default artistsService;
