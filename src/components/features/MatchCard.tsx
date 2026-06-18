'use client';

import { Game } from '@/types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { LocalTime } from '../ui/local-time';
import { MapPin } from 'lucide-react';
import { getCountryColor, getFlagUrl } from '@/lib/countries';
import { getStadiumName } from '@/lib/stadiums';
import Image from 'next/image';
import { MatchCardFavoriteStar } from './MatchCardFavoriteStar';
import { getAbsoluteGameDate } from '@/lib/timezone';

interface MatchCardProps {
  game: Game;
}

export function MatchCard({ game }: MatchCardProps) {
  const isLive = game.finished === 'FALSE' && game.time_elapsed !== 'notstarted';
  let isFinished = game.finished === 'TRUE' || game.time_elapsed === 'finished';

  if (!isLive && !isFinished) {
    const gameTime = getAbsoluteGameDate(game.local_date, game.stadium_id).getTime();
    if (gameTime < Date.now() - 4 * 60 * 60 * 1000) {
      isFinished = true;
    }
  }

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
                  LIVE {game.time_elapsed}&apos;
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
            <LocalTime date={game.local_date} format="short" stadiumId={game.stadium_id} />
            <span className="text-muted-foreground mx-1">•</span>
            <LocalTime date={game.local_date} format="time" stadiumId={game.stadium_id} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MatchCardFavoriteStar teamId={game.home_team_id} />
              {homeFlag && (
                <div className="relative w-8 h-5.5 shrink-0 overflow-hidden rounded-sm shadow-sm">
                  <Image src={homeFlag} alt={game.home_team_name_en} fill className="object-cover" sizes="32px" />
                </div>
              )}
              <span className="font-bold text-lg sm:text-xl truncate max-w-[120px] sm:max-w-[180px]">
                {game.home_team_name_en}
              </span>
            </div>
            <span className="font-bold text-2xl">{isFinished || isLive ? game.home_score : '-'}</span>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MatchCardFavoriteStar teamId={game.away_team_id} />
              {awayFlag && (
                <div className="relative w-8 h-5.5 shrink-0 overflow-hidden rounded-sm shadow-sm">
                  <Image src={awayFlag} alt={game.away_team_name_en} fill className="object-cover" sizes="32px" />
                </div>
              )}
              <span className="font-bold text-lg sm:text-xl truncate max-w-[120px] sm:max-w-[180px]">
                {game.away_team_name_en}
              </span>
            </div>
            <span className="font-bold text-2xl">{isFinished || isLive ? game.away_score : '-'}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between items-center">
          <span className="truncate pr-4 max-w-[200px] flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> 
            {getStadiumName(game.stadium_id)}
          </span>
          {/* <Link href={`/match/${game.id}`} className={buttonVariants({ variant: "link", className: "p-0 h-auto text-primary shrink-0" })}>Match Details →</Link> */}
        </div>
      </CardContent>
    </Card>
  );
}
