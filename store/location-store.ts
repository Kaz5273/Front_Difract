import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Coords = { latitude: number; longitude: number };

interface LocationState {
  city: string;
  isManualCity: boolean;
  manualCoords: Coords | null;
  setCity: (city: string) => void;
  setManualCity: (city: string, coords: Coords) => void;
  clearCity: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      city: "",
      isManualCity: false,
      manualCoords: null,
      setCity: (city) => set({ city, isManualCity: false, manualCoords: null }),
      setManualCity: (city, coords) => set({ city, isManualCity: true, manualCoords: coords }),
      clearCity: () => set({ city: "", isManualCity: false, manualCoords: null }),
    }),
    {
      name: "location-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
