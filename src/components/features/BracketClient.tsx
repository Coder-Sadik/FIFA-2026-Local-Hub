'use client';

import { useState, useEffect } from 'react';
import { Game } from '@/types';
import { getFlagUrl } from '@/lib/countries';
import { format, parse } from 'date-fns';

interface BracketClientProps {
  games: Game[];
}

const getTeamDisplay = (game: Game, type: 'home' | 'away') => {
  const isHome = type === 'home';
  const id = isHome ? game.home_team_id : game.away_team_id;
  const label = isHome ? game.home_team_label : game.away_team_label;
  const name = isHome ? game.home_team_name_en : game.away_team_name_en;
  const score = isHome ? game.home_score : game.away_score;
  
  if (id === '0' || !id || id === 'null') {
    return { name: label || 'TBD', flag: null, score: null };
  }
  
  return { 
    name: name || 'TBD', 
    flag: getFlagUrl(name || ''), 
    score: game.finished === 'TRUE' ? score : null 
  };
};

const MatchBox = ({ game }: { game: Game }) => {
  const home = getTeamDisplay(game, 'home');
  const away = getTeamDisplay(game, 'away');

  // Attempt to format date nicely
  let dateDisplay = game.local_date;
  try {
    const parsedDate = parse(game.local_date, 'MM/dd/yyyy HH:mm', new Date());
    dateDisplay = format(parsedDate, 'MMM d • HH:mm');
  } catch (e) {
    // fallback to raw
  }

  return (
    <div className="w-56 bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col text-sm shrink-0">
      <div className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold text-center py-1 border-b">
        {dateDisplay}
      </div>
      
      {/* Home Team */}
      <div className="flex items-center justify-between p-2 border-b bg-background">
        <div className="flex items-center gap-2 truncate">
          {home.flag ? (
            <img src={home.flag} alt={home.name} className="w-4 h-4 object-contain" />
          ) : (
            <div className="w-4 h-4 bg-muted rounded-full" />
          )}
          <span className="truncate font-medium">{home.name}</span>
        </div>
        {home.score !== null && (
          <span className="font-bold ml-2">{home.score}</span>
        )}
      </div>

      {/* Away Team */}
      <div className="flex items-center justify-between p-2 bg-background">
        <div className="flex items-center gap-2 truncate">
          {away.flag ? (
            <img src={away.flag} alt={away.name} className="w-4 h-4 object-contain" />
          ) : (
            <div className="w-4 h-4 bg-muted rounded-full" />
          )}
          <span className="truncate font-medium">{away.name}</span>
        </div>
        {away.score !== null && (
          <span className="font-bold ml-2">{away.score}</span>
        )}
      </div>
    </div>
  );
};

export function BracketClient({ games }: BracketClientProps) {
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Filter games by rounds
  const r32 = games.filter(g => g.type === 'r32').sort((a, b) => Number(a.id) - Number(b.id));
  const r16 = games.filter(g => g.type === 'r16').sort((a, b) => Number(a.id) - Number(b.id));
  const qf = games.filter(g => g.type === 'qf').sort((a, b) => Number(a.id) - Number(b.id));
  const sf = games.filter(g => g.type === 'sf').sort((a, b) => Number(a.id) - Number(b.id));
  const third = games.filter(g => g.type === 'third').sort((a, b) => Number(a.id) - Number(b.id));
  const final = games.filter(g => g.type === 'final').sort((a, b) => Number(a.id) - Number(b.id));

  return (
    <div className="w-full overflow-x-auto pb-12 cursor-grab active:cursor-grabbing scrollbar-hide">
      <div className="min-w-[1200px] p-8 flex gap-12 h-[1200px]">
        
        {/* Round of 32 */}
        <div className="flex flex-col justify-around flex-1 h-full">
          <h3 className="text-center font-bold text-lg text-muted-foreground mb-4 uppercase">Round of 32</h3>
          {r32.map(game => <MatchBox key={game.id} game={game} />)}
        </div>

        {/* Round of 16 */}
        <div className="flex flex-col justify-around flex-1 h-full">
          <h3 className="text-center font-bold text-lg text-muted-foreground mb-4 uppercase">Round of 16</h3>
          {r16.map(game => <MatchBox key={game.id} game={game} />)}
        </div>

        {/* Quarter-Finals */}
        <div className="flex flex-col justify-around flex-1 h-full">
          <h3 className="text-center font-bold text-lg text-muted-foreground mb-4 uppercase">Quarter-Finals</h3>
          {qf.map(game => <MatchBox key={game.id} game={game} />)}
        </div>

        {/* Semi-Finals */}
        <div className="flex flex-col justify-around flex-1 h-full">
          <h3 className="text-center font-bold text-lg text-muted-foreground mb-4 uppercase">Semi-Finals</h3>
          {sf.map(game => <MatchBox key={game.id} game={game} />)}
        </div>

        {/* Final & Third Place */}
        <div className="flex flex-col justify-center gap-32 flex-1 h-full relative">
          <div className="flex flex-col gap-4">
            <h3 className="text-center font-black text-2xl text-primary mb-2 uppercase drop-shadow-md">Final</h3>
            {final.map(game => <MatchBox key={game.id} game={game} />)}
          </div>
          
          <div className="flex flex-col gap-4 mt-16">
            <h3 className="text-center font-bold text-md text-muted-foreground mb-2 uppercase">Third Place</h3>
            {third.map(game => <MatchBox key={game.id} game={game} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
