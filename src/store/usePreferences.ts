import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  timezone: string;
  favoriteTeams: string[]; // Team IDs
  setTimezone: (tz: string) => void;
  toggleFavoriteTeam: (teamId: string) => void;
}

// Get the user's system timezone automatically
const defaultTimezone = typeof window !== 'undefined' 
  ? Intl.DateTimeFormat().resolvedOptions().timeZone 
  : 'UTC';

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      timezone: defaultTimezone,
      favoriteTeams: [],
      setTimezone: (tz) => set({ timezone: tz }),
      toggleFavoriteTeam: (teamId) =>
        set((state) => ({
          favoriteTeams: state.favoriteTeams.includes(teamId)
            ? state.favoriteTeams.filter((id) => id !== teamId)
            : [...state.favoriteTeams, teamId],
        })),
    }),
    {
      name: 'wc26-preferences', // saved in localStorage
    }
  )
);
