import { create } from 'zustand';
import { User } from '@/services/api/types';
import { storage } from '@/utils/storage';
import { authService, AuthResponse } from '@/services/auth/auth.service';

interface AuthState {
  // État
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string, 
    email: string, 
    password: string, 
    role?: 'PUBLIC' | 'ARTIST',
    primaryStyleId?: number | null,
    secondaryStyleIds?: number[]
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // État initial
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // ============================================
  // LOGIN
  // ============================================
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      console.log('🔐 Attempting login...');
      
      const response: AuthResponse = await authService.login({ email, password });
      
      // Sauvegarder dans AsyncStorage
      await storage.saveToken(response.token);
      await storage.saveUser(response.user);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Login successful:', response.user.email);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      
      console.error('❌ Login failed:', errorMessage);
      throw error;
    }
  },

  // ============================================
  // REGISTER
  // ============================================
  register: async (name: string, email: string, password: string, role: 'PUBLIC' | 'ARTIST' = 'PUBLIC', primaryStyleId?: number | null,
    secondaryStyleIds?: number[]) => {
    try {
      set({ isLoading: true, error: null });
      console.log('📝 Attempting registration...');
      
          const payload: any = {
      name,
      email,
      password,
      password_confirmation: password,
      role,
    };
      if (role === 'ARTIST' && primaryStyleId) {
        payload.primary_style_id = primaryStyleId;
        payload.secondary_style_ids = secondaryStyleIds || [];
        console.log('🎵 Registering artist with styles:', {
          primary: primaryStyleId,
          secondary: secondaryStyleIds,
        });
      }

       const response: AuthResponse = await authService.register(payload);
      // Sauvegarder dans AsyncStorage
      await storage.saveToken(response.token);
      await storage.saveUser(response.user);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Registration successful:', response.user.email);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur d'inscription";
      
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      
      console.error('❌ Registration failed:', errorMessage);
      throw error;
    }
  },

  // ============================================
  // LOGOUT
  // ============================================
  logout: async () => {
    try {
      console.log('🚪 Logging out...');
      set({ isLoading: true });
      
      // Appeler l'API de déconnexion
      await authService.logout();
      
      // Nettoyer le stockage local
      await storage.clearAll();
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Même en cas d'erreur, nettoyer le stockage
      await storage.clearAll();
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // ============================================
  // LOAD USER (au démarrage de l'app)
  // ============================================
  loadUser: async () => {
    try {
      set({ isLoading: true });
      console.log('🔄 Loading user from storage...');
      
      const token = await storage.getToken();
      
      if (!token) {
        console.log('ℹ️ No token found');
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Récupérer les données actuelles depuis l'API
      try {
        const user: User = await authService.me();
        
        await storage.saveUser(user);
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        console.log('✅ User loaded successfully:', user.email);
      } catch (error) {
        // Si l'API échoue, utiliser les données en cache
        const savedUser = await storage.getUser();
        
        if (savedUser) {
          set({
            user: savedUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log('⚠️ Using cached user data');
        } else {
          // Token invalide
          await storage.clearAll();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          console.log('❌ Invalid token, cleared storage');
        }
      }
    } catch (error) {
      console.error('❌ Load user error:', error);
      await storage.clearAll();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // ============================================
  // UPDATE USER
  // ============================================
  updateUser: (user: User) => {
    set({ user });
    storage.saveUser(user);
    console.log('✅ User updated');
  },

  // ============================================
  // CLEAR ERROR
  // ============================================
  clearError: () => set({ error: null }),
}));