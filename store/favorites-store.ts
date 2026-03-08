import { create } from 'zustand';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { Artist } from '@/services/api/types';

interface FavoritesStore {
  ids: Set<string>;
  isLoaded: boolean;
  load: () => Promise<void>;
  add: (artistId: string) => Promise<void>;
  remove: (artistId: string) => Promise<void>;
  isFavorite: (artistId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  ids: new Set(),
  isLoaded: false,

  load: async () => {
    try {
      const res = await apiClient.get<Artist[]>(ENDPOINTS.MY_FAVORITE_ARTISTS);
      set({ ids: new Set(res.data.map((a) => String(a.id))), isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  add: async (artistId: string) => {
    // Optimistic
    set((s) => ({ ids: new Set([...s.ids, artistId]) }));
    try {
      await apiClient.post(ENDPOINTS.FAVORITE_ARTIST(artistId));
    } catch {
      set((s) => {
        const next = new Set(s.ids);
        next.delete(artistId);
        return { ids: next };
      });
    }
  },

  remove: async (artistId: string) => {
    // Optimistic
    set((s) => {
      const next = new Set(s.ids);
      next.delete(artistId);
      return { ids: next };
    });
    try {
      await apiClient.delete(ENDPOINTS.FAVORITE_ARTIST(artistId));
    } catch {
      set((s) => ({ ids: new Set([...s.ids, artistId]) }));
    }
  },

  isFavorite: (artistId: string) => get().ids.has(artistId),
}));
