import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type {
    LoginCredentials,
    RegisterCredentials,
    User,
} from '../api/types';

/**
 * Interface de réponse Laravel pour login et verify-email
 */
interface LaravelAuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

/**
 * Réponse du register (pas de token, juste un message + email)
 */
export interface RegisterResponse {
  message: string;
  email: string;
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
   * Inscription — crée le compte + envoie un code de vérification par email
   * Ne retourne PAS de token : il faut vérifier l'email d'abord
   */
  register: async (data: RegisterCredentials): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      ENDPOINTS.REGISTER,
      data
    );

    console.log('🔍 Register response:', response.data);
    return response.data;
  },

  /**
   * Vérifier le code email → retourne le token + user
   */
  verifyEmail: async (email: string, code: string): Promise<AuthResponse> => {
    const response = await apiClient.post<LaravelAuthResponse>(
      ENDPOINTS.VERIFY_EMAIL,
      { email, code }
    );

    console.log('🔍 Verify email response:', response.data);

    return {
      token: response.data.access_token,
      user: response.data.user,
    };
  },

  /**
   * Renvoyer un code de vérification
   */
  resendCode: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      ENDPOINTS.RESEND_CODE,
      { email }
    );

    console.log('🔍 Resend code response:', response.data);
    return response.data;
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