'use client';

import { useEffect } from 'react';
import { usePreferences } from '@/store/usePreferences';
import { getCountryColor } from '@/lib/countries';
import { Team } from '@/types';

export function ThemeProvider({ children, teams }: { children: React.ReactNode; teams: Team[] }) {
  const { favoriteTeams } = usePreferences();

  useEffect(() => {
    if (!favoriteTeams || favoriteTeams.length === 0) {
      document.documentElement.style.removeProperty('--primary');
      return;
    }

    const firstFavoriteTeamId = favoriteTeams[0];
    const team = teams.find(t => t.id === firstFavoriteTeamId);
    if (team) {
      const colorHex = getCountryColor(team.name_en);
      if (colorHex && colorHex !== '#808080') {
        // Tailwind v4 --primary expects a color string, typically `oklch(...)`. 
        // We can pass a raw hex value directly and it works in most browsers for generic properties.
        document.documentElement.style.setProperty('--primary', colorHex);
      }
    }
  }, [favoriteTeams, teams]);

  return <>{children}</>;
}
