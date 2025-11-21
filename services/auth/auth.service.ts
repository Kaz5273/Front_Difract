import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type {
    LoginCredentials,
    RegisterCredentials,
    User,
} from '../api/types';

/**
 * Interface de réponse Laravel (ce que l'API renvoie réellement)
 */
interface LaravelAuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

/**
 * Interface pour le frontend (ce qu'on veut utiliser dans l'app)
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Inscription d'un nouvel utilisateur (route publique)
   */
  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<LaravelAuthResponse>(
      ENDPOINTS.REGISTER,
      data
    );
    
    console.log('🔍 Register response:', response.data);
    
    // Mapper la réponse Laravel vers notre format
    return {
      token: response.data.access_token,
      user: response.data.user,
    };
  },

  /**
   * Connexion et récupération du token (route publique)
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<LaravelAuthResponse>(
      ENDPOINTS.LOGIN,
      credentials
    );
    
    console.log('🔍 Login response:', response.data);
    
    // Mapper la réponse Laravel vers notre format
    return {
      token: response.data.access_token,
      user: response.data.user,
    };
  },

  /**
   * Déconnexion - révocation du token (route protégée)
   */
  logout: async (): Promise<void> => {
    const response = await apiClient.post(ENDPOINTS.LOGOUT);
    console.log('🔍 Logout response:', response.data);
  },
  
  /**
   * Récupérer les informations de l'utilisateur connecté (route protégée)
   */
  me: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>(ENDPOINTS.ME);
    
    // Si Laravel renvoie directement l'objet user
    if (response.data.user) {
      return response.data.user;
    }
    
    // Si Laravel renvoie l'objet à la racine
    return response.data as unknown as User;
  },
};

export default authService;