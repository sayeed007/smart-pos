
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Location } from '@/types';
import { MOCK_LOCATIONS } from '@/lib/mock-data';

interface LocationState {
    currentLocation: Location;
    locations: Location[];
    setLocation: (id: string) => void;
}

export const useLocationStore = create<LocationState>()(
    persist(
        (set) => ({
            currentLocation: MOCK_LOCATIONS[0],
            locations: MOCK_LOCATIONS,
            setLocation: (id) => set((state) => {
                const found = state.locations.find((l) => l.id === id);
                return found ? { currentLocation: found } : {};
            }),
        }),
        {
            name: 'location-storage',
            partialize: (state) => ({ currentLocation: state.currentLocation }),
        }
    )
);
