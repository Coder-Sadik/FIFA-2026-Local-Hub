'use client';

import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { usePreferences } from '@/store/usePreferences';
import { useEffect, useState } from 'react';

interface FavoriteTeamButtonProps {
  teamId: string;
}

export function FavoriteTeamButton({ teamId }: FavoriteTeamButtonProps) {
  const { favoriteTeams, toggleFavoriteTeam } = usePreferences();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFavorite = mounted && favoriteTeams.includes(teamId);

  return (
    <Button 
      variant="outline" 
      className={`gap-2 transition-colors ${isFavorite ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-500/10' : ''}`}
      onClick={() => toggleFavoriteTeam(teamId)}
    >
      <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} /> 
      {isFavorite ? 'Favorited' : 'Add to Favorites'}
    </Button>
  );
}
