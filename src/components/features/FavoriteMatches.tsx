'use client';

import { Game } from '@/types';
import { usePreferences } from '@/store/usePreferences';
import { MatchCard } from '@/components/features/MatchCard';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export function FavoriteMatches({ allGames }: { allGames: Game[] }) {
  const { favoriteTeams } = usePreferences();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line
  useEffect(() => setMounted(true), []);

  if (!mounted || favoriteTeams.length === 0) return null;

  const favGames = allGames.filter(
    g => favoriteTeams.includes(g.home_team_id) || favoriteTeams.includes(g.away_team_id)
  );

  if (favGames.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center space-x-2 mb-6">
        <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
        <h2 className="text-2xl font-bold tracking-tight">Your Favorites</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favGames.slice(0, 3).map(game => (
          <MatchCard key={game._id} game={game} />
        ))}
      </div>
    </section>
  );
}
