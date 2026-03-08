import { useState, useCallback } from 'react';
import { artistsService, ArtistDetail } from '@/services/artists/artists.service';
import { Artist } from '@/services/api/types';

export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArtists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await artistsService.getAll();
      setArtists(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Impossible de charger les artistes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTopArtists = useCallback(async (limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await artistsService.getTop(limit);
      setArtists(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Impossible de charger les artistes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { artists, isLoading, error, fetchArtists, fetchTopArtists };
}

export function useArtistDetail(id: number) {
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [detail, basic] = await Promise.all([
        artistsService.getDetail(id),
        artistsService.getById(id),
      ]);
      // Merge track titles from basic listing (detail endpoint doesn't return them)
      if (detail.media && basic.media) {
        const titleMap = new Map(basic.media.map((m) => [m.id, m.title]));
        detail.media = detail.media.map((m) => ({
          ...m,
          title: m.title || titleMap.get(m.id) || null,
        }));
      }
      setArtist(detail);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Impossible de charger l\'artiste');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { artist, isLoading, error, fetchDetail };
}
