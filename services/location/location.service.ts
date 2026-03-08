import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';

const LOCATION_CACHE_KEY = '@difract_location';
const LOCATION_PREF_KEY = '@difract_location_enabled';

export interface LocationData {
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  location_tracking_enabled?: boolean;
}

export const locationService = {
  requestPermission: async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  hasPermission: async (): Promise<boolean> => {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  },

  /** Préférence utilisateur stockée localement (indépendante de la permission OS) */
  getUserPreference: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(LOCATION_PREF_KEY);
      // Par défaut: activé si la valeur n'a jamais été définie
      return value === null ? true : value === 'true';
    } catch {
      return true;
    }
  },

  setUserPreference: async (enabled: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(LOCATION_PREF_KEY, String(enabled));
    } catch {}
  },

  /** Retourne true si la permission OS est accordée ET l'utilisateur a activé la géoloc */
  isLocationActive: async (): Promise<boolean> => {
    const [permission, preference] = await Promise.all([
      locationService.hasPermission(),
      locationService.getUserPreference(),
    ]);
    return permission && preference;
  },

  getCurrentPosition: async (): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      return null;
    }
  },

  getCityFromCoords: async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
      return result?.city || result?.subregion || null;
    } catch {
      return null;
    }
  },

  updateBackend: async (data: LocationData): Promise<void> => {
    await apiClient.put(ENDPOINTS.ME_LOCATION, data);
  },

  /** Récupère la position GPS et met à jour le backend silencieusement */
  updateLocationInBackground: async (): Promise<void> => {
    try {
      const active = await locationService.isLocationActive();
      if (!active) return;

      const coords = await locationService.getCurrentPosition();
      if (!coords) return;

      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(coords));
      await locationService.updateBackend({ ...coords, location_tracking_enabled: true });
    } catch {
      // Silently fail — never block app usage
    }
  },

  /**
   * Active ou désactive le tracking de localisation :
   * - Sauvegarde la préférence locale
   * - Notifie le backend via PUT /me/location
   * - Si activation : envoie aussi les coordonnées GPS actuelles
   */
  setTrackingEnabled: async (enabled: boolean): Promise<void> => {
    await locationService.setUserPreference(enabled);
    if (enabled) {
      const coords = await locationService.getCurrentPosition();
      await locationService.updateBackend({
        ...(coords ?? {}),
        location_tracking_enabled: true,
      });
    } else {
      await locationService.updateBackend({ location_tracking_enabled: false });
    }
  },

  getCachedLocation: async (): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },
};

export default locationService;
