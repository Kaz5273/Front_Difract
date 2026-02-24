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
    secondaryStyleIds?: number[],
    bio?: string
  ) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
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
  // REGISTER (ne retourne plus de token)
  // ============================================
  register: async (name: string, email: string, password: string, role: 'PUBLIC' | 'ARTIST' = 'PUBLIC', primaryStyleId?: number | null,
    secondaryStyleIds?: number[], bio?: string) => {
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

      if (bio) {
        payload.bio = bio;
      }

      await authService.register(payload);

      set({ isLoading: false, error: null });

      console.log('✅ Registration successful, verification code sent to:', email);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur d'inscription";

      set({
        error: errorMessage,
        isLoading: false,
      });

      console.error('❌ Registration failed:', errorMessage);
      throw error;
    }
  },

  // ============================================
  // VERIFY EMAIL (retourne le token + user)
  // ============================================
  verifyEmail: async (email: string, code: string) => {
    try {
      set({ isLoading: true, error: null });
      console.log('📧 Verifying email code...');

      const response: AuthResponse = await authService.verifyEmail(email, code);

      await storage.saveToken(response.token);
      await storage.saveUser(response.user);

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('✅ Email verified:', response.user.email);
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.code?.[0]
        || error.response?.data?.message
        || 'Code invalide ou expiré';

      set({
        error: errorMessage,
        isLoading: false,
      });

      console.error('❌ Email verification failed:', errorMessage);
      throw error;
    }
  },

  // ============================================
  // RESEND CODE
  // ============================================
  resendCode: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      console.log('📨 Resending verification code...');

      await authService.resendCode(email);

      set({ isLoading: false, error: null });
      console.log('✅ Verification code resent to:', email);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Impossible de renvoyer le code';

      set({
        error: errorMessage,
        isLoading: false,
      });

      console.error('❌ Resend code failed:', errorMessage);
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

      await authService.logout();
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
