'use client';

import { Game } from '@/types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { buttonVariants } from '../ui/button';
import Link from 'next/link';
import { LocalTime } from '../ui/local-time';
import { usePreferences } from '@/store/usePreferences';
import { Star } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { getCountryColor, getFlagUrl } from '@/lib/countries';

interface MatchCardProps {
  game: Game;
}

export function MatchCard({ game }: MatchCardProps) {
  const { favoriteTeams, toggleFavoriteTeam } = usePreferences();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isLive = game.finished === 'FALSE' && game.time_elapsed !== 'notstarted';
  const isFinished = game.finished === 'TRUE' || game.time_elapsed === 'finished';
  
  const homeFav = mounted && favoriteTeams.includes(game.home_team_id);
  const awayFav = mounted && favoriteTeams.includes(game.away_team_id);

  const homeColor = getCountryColor(game.home_team_name_en);
  const awayColor = getCountryColor(game.away_team_name_en);
  const homeFlag = getFlagUrl(game.home_team_name_en, 'w80');
  const awayFlag = getFlagUrl(game.away_team_name_en, 'w80');

  const gradientStyle = {
    background: `linear-gradient(135deg, ${homeColor}1A 0%, rgba(0,0,0,0) 50%, ${awayColor}1A 100%)`,
    backgroundColor: 'hsl(var(--background) / 0.8)'
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all hover:border-primary/50 backdrop-blur-md`}
      style={gradientStyle}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant={isLive ? "destructive" : isFinished ? "secondary" : "outline"} className="animate-in fade-in">
              {isLive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-1" />
                  LIVE {game.time_elapsed}'
                </>
              ) : isFinished ? (
                'FT'
              ) : (
                'Upcoming'
              )}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">Group {game.group}</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground flex items-center">
            <LocalTime dateString={game.local_date} format="short" />
            <span className="mx-1">•</span>
            <LocalTime dateString={game.local_date} format="time" />
          </div>
        </div>

        <div className="space-y-4">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => toggleFavoriteTeam(game.home_team_id)}
              >
                <Star className={`h-4 w-4 ${homeFav ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
              </Button>
              {homeFlag && <img src={homeFlag} alt="" className="w-8 h-5.5 rounded-sm shadow-sm object-cover" />}
              <span className="font-bold text-lg sm:text-xl truncate max-w-[120px] sm:max-w-[180px]">
                {game.home_team_name_en}
              </span>
            </div>
            <span className="font-bold text-2xl">{isFinished || isLive ? game.home_score : '-'}</span>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => toggleFavoriteTeam(game.away_team_id)}
              >
                <Star className={`h-4 w-4 ${awayFav ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
              </Button>
              {awayFlag && <img src={awayFlag} alt="" className="w-8 h-5.5 rounded-sm shadow-sm object-cover" />}
              <span className="font-bold text-lg sm:text-xl truncate max-w-[120px] sm:max-w-[180px]">
                {game.away_team_name_en}
              </span>
            </div>
            <span className="font-bold text-2xl">{isFinished || isLive ? game.away_score : '-'}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between items-center">
          <span>Stadium ID: {game.stadium_id}</span>
          <Link href={`/match/${game.id}`} className={buttonVariants({ variant: "link", className: "p-0 h-auto text-primary" })}>Match Details →</Link>
        </div>
      </CardContent>
    </Card>
  );
}
