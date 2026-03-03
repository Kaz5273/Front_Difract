import { create } from 'zustand';
import { User, Media } from '@/services/api/types';
import { storage } from '@/utils/storage';
import { authService, AuthResponse } from '@/services/auth/auth.service';
import { userService } from '@/services/user/user.service';

/**
 * Récupère les médias via GET /media et les fusionne dans le user
 * Utilisé comme fallback quand GET /me ne retourne pas media[]
 */
async function fetchAndMergeMedia(user: User): Promise<User> {
  try {
    const grouped = await userService.getMedia();
    const mediaList: Media[] = [];
    if (grouped.profile_picture) mediaList.push(grouped.profile_picture);
    if (grouped.gallery?.length) mediaList.push(...grouped.gallery);
    if (grouped.tracks?.length) mediaList.push(...grouped.tracks);
    if (grouped.intro_video) mediaList.push(grouped.intro_video);
    console.log('📷 Fetched media separately:', mediaList.length, 'items');
    return { ...user, media: mediaList };
  } catch (err) {
    console.warn('⚠️ Failed to fetch media separately:', err);
    return user;
  }
}

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

      // Sauvegarder le token dans AsyncStorage
      await storage.saveToken(response.token);

      // Re-fetch le profil complet (avec media[]) depuis GET /me
      let fullUser = response.user;
      try {
        fullUser = await authService.me();
        console.log('📷 /me media count:', fullUser.media?.length ?? 'undefined');
      } catch (meError) {
        console.warn('⚠️ GET /me failed after login:', meError);
      }

      // Fallback : si pas de media, les récupérer via GET /media
      if (!fullUser.media || fullUser.media.length === 0) {
        fullUser = await fetchAndMergeMedia(fullUser);
      }

      await storage.saveUser(fullUser);

      set({
        user: fullUser,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('✅ Login successful:', fullUser.email, '| media:', fullUser.media?.length ?? 0);
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

      // Sauvegarder le token dans AsyncStorage
      await storage.saveToken(response.token);

      // Re-fetch le profil complet (avec media[]) depuis GET /me
      let fullUser = response.user;
      try {
        fullUser = await authService.me();
        console.log('📷 /me media count:', fullUser.media?.length ?? 'undefined');
      } catch (meError) {
        console.warn('⚠️ GET /me failed after verifyEmail:', meError);
      }

      // Fallback : si pas de media, les récupérer via GET /media
      if (!fullUser.media || fullUser.media.length === 0) {
        fullUser = await fetchAndMergeMedia(fullUser);
      }

      await storage.saveUser(fullUser);

      set({
        user: fullUser,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('✅ Email verified:', fullUser.email, '| media:', fullUser.media?.length ?? 0);
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
        let user: User = await authService.me();
        console.log('📷 /me media count:', user.media?.length ?? 'undefined');

        // Fallback : si pas de media, les récupérer via GET /media
        if (!user.media || user.media.length === 0) {
          user = await fetchAndMergeMedia(user);
        }

        await storage.saveUser(user);

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        console.log('✅ User loaded successfully:', user.email, '| media:', user.media?.length ?? 0);
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
