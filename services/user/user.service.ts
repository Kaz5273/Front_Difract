import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type {
  User,
  Media,
  MediaGrouped,
  MediaUploadResponse,
  MediaReorderPayload,
  SocialLink,
} from '../api/types';

export const userService = {
  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>(ENDPOINTS.ME);
    return response.data;
  },

  /**
   * Mettre à jour le profil (utilise PUT /users/{id})
   */
  updateProfile: async (
    userId: number,
    data: Partial<Pick<User, 'name' | 'bio' | 'city' | 'postal_code'>>
  ): Promise<User> => {
    const response = await apiClient.put<User>(
      ENDPOINTS.USER_BY_ID(userId),
      data
    );
    return response.data;
  },

  // ============================================
  // MEDIA
  // ============================================

  /**
   * Récupérer tous les médias de l'utilisateur connecté (groupés)
   */
  getMedia: async (): Promise<MediaGrouped> => {
    const response = await apiClient.get<MediaGrouped>(ENDPOINTS.MEDIA);
    return response.data;
  },

  /**
   * Upload photo de profil
   * FormData avec champ: image (max 5MB, jpeg/png/jpg/gif)
   */
  uploadProfilePicture: async (file: FormData): Promise<MediaUploadResponse> => {
    const response = await apiClient.post<MediaUploadResponse>(
      ENDPOINTS.MEDIA_PROFILE_PICTURE,
      file,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      }
    );
    return response.data;
  },

  /**
   * Upload images de galerie (max 10 par requête)
   * FormData avec champ: images[] (max 5MB chacune, jpeg/png/jpg/gif)
   */
  uploadGallery: async (file: FormData): Promise<MediaUploadResponse> => {
    const response = await apiClient.post<MediaUploadResponse>(
      ENDPOINTS.MEDIA_GALLERY,
      file,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      }
    );
    return response.data;
  },

  /**
   * Upload de tracks audio (max 4 par requête)
   * FormData avec champ: tracks[] (max 20MB chacune, mp3/wav/ogg)
   */
  uploadTracks: async (file: FormData): Promise<MediaUploadResponse> => {
    const response = await apiClient.post<MediaUploadResponse>(
      ENDPOINTS.MEDIA_TRACKS,
      file,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      }
    );
    return response.data;
  },

  /**
   * Upload vidéo d'introduction (max 50MB, mp4/mov/avi)
   * FormData avec champ: video
   */
  uploadIntroVideo: async (file: FormData): Promise<MediaUploadResponse> => {
    const response = await apiClient.post<MediaUploadResponse>(
      ENDPOINTS.MEDIA_INTRO_VIDEO,
      file,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000, // 3 min pour les vidéos volumineuses
      }
    );
    return response.data;
  },

  /**
   * Supprimer un média
   */
  deleteMedia: async (mediaId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.MEDIA_DELETE(mediaId)
    );
    return response.data;
  },

  /**
   * Réordonner les médias (galerie ou tracks)
   */
  reorderMedia: async (payload: MediaReorderPayload): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      ENDPOINTS.MEDIA_REORDER,
      payload
    );
    return response.data;
  },

  // ============================================
  // SOCIAL LINKS
  // ============================================

  /**
   * Récupérer les liens sociaux d'un artiste (public)
   */
  getSocialLinks: async (userId: number): Promise<SocialLink[]> => {
    const response = await apiClient.get<SocialLink[]>(
      ENDPOINTS.SOCIAL_LINKS(userId)
    );
    return response.data;
  },

  /**
   * Mettre à jour les liens sociaux (remplace tout)
   * L'API attend un objet avec les plateformes comme clés :
   * { "soundcloud": "https://...", "instagram": "https://..." }
   */
  updateSocialLinks: async (
    links: { platform: string; url: string }[]
  ): Promise<SocialLink[]> => {
    // Transformer le tableau en objet { platform: url }
    const payload: Record<string, string> = {};
    for (const link of links) {
      payload[link.platform] = link.url;
    }
    console.log('📤 updateSocialLinks payload:', JSON.stringify(payload));
    const response = await apiClient.put<SocialLink[]>(
      ENDPOINTS.ME_SOCIAL_LINKS,
      payload
    );
    console.log('📥 updateSocialLinks response:', JSON.stringify(response.data));
    return response.data;
  },

  // ============================================
  // ROLE
  // ============================================

  /**
   * Devenir artiste (changer de rôle PUBLIC → ARTIST)
   */
  becomeArtist: async (): Promise<User> => {
    const response = await apiClient.post<User>('/api/users/become-artist');
    return response.data;
  },
};