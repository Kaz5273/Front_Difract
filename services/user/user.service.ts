import { apiClient } from '../api/client';
import { User } from '../api/types';

export const userService = {
  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/users/profile');
    return response.data;
  },

  /**
   * Mettre à jour le profil
   */
  updateProfile: async (data: Partial<Omit<User, 'id' | 'email' | 'created_at' | 'updated_at'>>): Promise<User> => {
    const response = await apiClient.put<User>('/api/users/profile', data);
    return response.data;
  },

  /**
   * Upload photo de profil
   */
  uploadProfilePicture: async (file: FormData) => {
    const response = await apiClient.post(
      '/api/media/profile-picture',
      file,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      }
    );
    return response.data;
  },

  /**
   * Upload de tracks audio
   */
  uploadTracks: async (file: FormData) => {
    const response = await apiClient.post(
      '/api/media/tracks',
      file,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      }
    );
    return response.data;
  },

  /**
   * Devenir artiste (changer de rôle PUBLIC → ARTIST)
   */
  becomeArtist: async (): Promise<User> => {
    const response = await apiClient.post<User>('/api/users/become-artist');
    return response.data;
  },

  /**
   * Récupérer les votes de l'utilisateur
   */
  getMyVotes: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/api/users/my-votes');
    return response.data;
  },

  /**
   * Récupérer les votes reçus (si artiste)
   */
  getReceivedVotes: async (): Promise<{ votes_count: number; voters: User[] }> => {
    const response = await apiClient.get<{ votes_count: number; voters: User[] }>(
      '/api/users/received-votes'
    );
    return response.data;
  },
};

export default userService;