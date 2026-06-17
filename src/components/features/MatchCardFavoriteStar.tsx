'use client';

import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { usePreferences } from '@/store/usePreferences';
import { useEffect, useState } from 'react';

interface MatchCardFavoriteStarProps {
  teamId: string;
}

export function MatchCardFavoriteStar({ teamId }: MatchCardFavoriteStarProps) {
  const { favoriteTeams, toggleFavoriteTeam } = usePreferences();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const isFavorite = mounted && favoriteTeams.includes(teamId);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-6 w-6" 
      onClick={(e) => {
        e.preventDefault(); // In case it's inside a link
        toggleFavoriteTeam(teamId);
      }}
    >
      <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
    </Button>
  );
}
