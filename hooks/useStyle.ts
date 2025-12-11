import { useState, useEffect } from 'react';
import { stylesService } from '@/services/styles/styles.service';
import type { MusicStyle } from '@/services/api/types';

export function useStyles() {
  // ✅ IMPORTANT : Initialiser avec un tableau vide
  const [styles, setStyles] = useState<MusicStyle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎵 Fetching music styles...');
      const data = await stylesService.getStyles();
      
      console.log('✅ Styles fetched:', data);
      console.log('✅ Is Array?:', Array.isArray(data));
      console.log('✅ Length:', data?.length);
      
      // ✅ Protection : vérifier que c'est bien un tableau
      if (Array.isArray(data)) {
        setStyles(data);
      } else {
        console.warn('⚠️ Data is not an array:', data);
        setStyles([]);
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Impossible de charger les styles musicaux';
      setError(errorMessage);
      console.error('❌ Error in useStyles:', err);
      setStyles([]);  // ✅ Toujours un tableau vide en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  return {
    styles,
    isLoading,
    error,
    refetch: fetchStyles,
  };
}