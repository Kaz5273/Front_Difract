import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { ApiResponse, CreateVoteRequest, Vote } from '../api/types';

/**
 * Service votes (CRUD sans update)
 * Un PUBLIC vote pour un ARTIST dans un EVENT
 */
export const votesService = {
  /**
   * Liste de tous les votes
   */
  getAll: async (): Promise<Vote[]> => {
    const response = await apiClient.get<ApiResponse<Vote[]>>(ENDPOINTS.VOTES);
    return response.data.data;
  },

  /**
   * Afficher un vote spécifique
   */
  getById: async (id: number | string): Promise<Vote> => {
    const response = await apiClient.get<ApiResponse<Vote>>(
      ENDPOINTS.VOTE_BY_ID(id)
    );
    return response.data.data;
  },

  /**
   * Créer un vote (PUBLIC vote pour un ARTIST dans un EVENT)
   */
  create: async (data: CreateVoteRequest): Promise<Vote> => {
    const response = await apiClient.post<ApiResponse<Vote>>(
      ENDPOINTS.VOTES,
      data
    );
    return response.data.data;
  },

  /**
   * Liste des votes de l'utilisateur connecté (avec relations event/artist)
   */
  getMyVotes: async (): Promise<Vote[]> => {
    const response = await apiClient.get<Vote[]>(ENDPOINTS.MY_VOTES);
    return response.data;
  },

  /**
   * Supprimer un vote
   */
  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.VOTE_BY_ID(id));
  },
};

export default votesService;
