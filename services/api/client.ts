import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '@/utils/storage';


export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://apidifract.kazllrd.fr';

/**
 * Construit l'URL complète d'un média à partir de son path relatif
 */
export function getMediaUrl(media: { url?: string; path?: string }): string | null {
  if (media.url) return media.url;
  if (media.path) return `${API_BASE_URL}/storage/${media.path}`;
  return null;
}
const API_TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 10000;

console.log('🌐 API Base URL:', API_BASE_URL);
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur de requête - Ajoute automatiquement le token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await storage.getToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (__DEV__) {
        console.log('🚀 API Request:', {
          url: config.url,
          method: config.method?.toUpperCase(),
          hasToken: !!token,
        });
      }
      
      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gère les erreurs 401 et 429
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (__DEV__) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        status,
        message: error.message,
        data: error.response?.data,
      });
    }

    if (status === 401 && error.config?.headers?.Authorization) {
      console.warn('⚠️ Unauthorized - Clearing auth data');
      await storage.clearAll();
    }

    // Retry automatique après délai si 429 (max 1 retry)
    if (status === 429 && error.config && !(error.config as any).__retried) {
      const retryAfter = Number(error.response?.headers?.['retry-after'] ?? 10);
      if (__DEV__) console.warn(`⏳ Rate limited — retry in ${retryAfter}s`);
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      (error.config as any).__retried = true;
      return apiClient.request(error.config);
    }

    return Promise.reject(error);
  }
);

export default apiClient;