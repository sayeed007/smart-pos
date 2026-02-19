import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Location } from "@/types";

interface LocationState {
  currentLocation: Location;
  locations: Location[];
  setLocation: (id: string) => void;
  setLocations: (locations: Location[]) => void;
}

// Default location used before real data is loaded from backend
const DEFAULT_LOCATION: Location = {
  id: "default",
  name: "Default",
  address: null,
  type: "STORE",
  status: "ACTIVE",
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      currentLocation: DEFAULT_LOCATION,
      locations: [DEFAULT_LOCATION],
      setLocation: (id) =>
        set((state) => {
          const found = state.locations.find((l) => l.id === id);
          return found ? { currentLocation: found } : {};
        }),
      setLocations: (locations) =>
        set((state) => {
          // If current location is the default or not in the new list, auto-select first
          const currentStillExists = locations.find(
            (l) => l.id === state.currentLocation.id,
          );
          return {
            locations,
            currentLocation:
              currentStillExists || locations[0] || DEFAULT_LOCATION,
          };
        }),
    }),
    {
      name: "location-storage",
      partialize: (state) => ({ currentLocation: state.currentLocation }),
    },
  ),
);
