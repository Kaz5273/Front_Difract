import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { MusicStyle } from '../api/types';  // ← Import depuis api/types

/**
 * Service pour gérer les styles musicaux
 */
export const stylesService = {
  /**
   * Récupère la liste de tous les styles musicaux
   * GET /api/styles
   */
  getStyles: async (): Promise<MusicStyle[]> => {
    try {
      console.log('🎵 Fetching music styles...');
      
      const response = await apiClient.get<MusicStyle[]>(ENDPOINTS.STYLES);
      
      console.log('✅ Styles fetched:', response.data.length, 'styles');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching styles:', error);
      throw error;
    }
  },

  /**
   * Récupère un style par son ID
   * GET /api/styles/:id
   */
  getStyleById: async (id: number): Promise<MusicStyle> => {
    try {
      const response = await apiClient.get<MusicStyle>(`${ENDPOINTS.STYLES}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error fetching style ${id}:`, error);
      throw error;
    }
  },
};

export default stylesService;