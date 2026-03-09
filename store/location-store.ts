import { create } from "zustand";

interface LocationState {
  city: string;
  setCity: (city: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  city: "",
  setCity: (city) => set({ city }),
}));
