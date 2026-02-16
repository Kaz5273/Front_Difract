import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '@/utils/storage';


const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://apidifract.kazllrd.fr';
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

// Intercepteur de réponse - Gère les erreurs 401
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
      });
    }
    
    if (status === 401) {
      console.warn('⚠️ Unauthorized - Clearing auth data');
      await storage.clearAll();
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;