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

const MatchBox = ({ game, roundIndex }: { game: Game, roundIndex: number }) => {
  const home = getTeamDisplay(game, 'home');
  const away = getTeamDisplay(game, 'away');

  let dateDisplay = game.local_date;
  try {
    const parsedDate = parse(game.local_date, 'MM/dd/yyyy HH:mm', new Date());
    dateDisplay = format(parsedDate, 'MMM d • HH:mm');
  } catch {}

  const isLive = game.finished === 'FALSE' && game.time_elapsed !== 'notstarted';
  const isFinished = game.finished === 'TRUE';
  
  // Determine winner for highlighting
  const homeWon = isFinished && Number(home.score) > Number(away.score);
  const awayWon = isFinished && Number(away.score) > Number(home.score);

  return (
    <div className="relative group w-64 shrink-0">
      {/* Visual Connector to next round (hidden on final) */}
      {roundIndex < 4 && (
        <div className="absolute top-1/2 -right-6 w-6 h-[2px] bg-border z-0 group-hover:bg-primary/50 transition-colors" />
      )}
      {/* Visual Connector from previous round (hidden on R32) */}
      {roundIndex > 0 && (
        <div className="absolute top-1/2 -left-6 w-6 h-[2px] bg-border z-0 group-hover:bg-primary/50 transition-colors" />
      )}

      <div className="relative z-10 bg-card/80 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden flex flex-col text-sm transition-all duration-300 hover:shadow-primary/20 hover:border-primary/40 hover:-translate-y-1 cursor-pointer">
        {/* Header line */}
        <div className={`h-1 w-full ${isLive ? 'bg-red-500 animate-pulse' : isFinished ? 'bg-muted' : 'bg-gradient-to-r from-primary to-emerald-400'}`} />
        
        <div className="bg-muted/30 text-muted-foreground text-[10px] tracking-wider uppercase font-bold text-center py-1.5 border-b border-white/5 flex items-center justify-center gap-2">
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
          {isLive ? <span className="text-red-500">LIVE {game.time_elapsed}&apos;</span> : dateDisplay}
        </div>
        
        {/* Home Team */}
        <div className={`flex items-center justify-between p-2.5 border-b border-white/5 transition-colors ${homeWon ? 'bg-primary/5' : ''}`}>
          <div className="flex items-center gap-3 truncate">
            {home.flag ? (
              <img src={home.flag} alt={home.name} className="w-5 h-5 object-contain drop-shadow-sm" />
            ) : (
              <div className="w-5 h-5 bg-muted rounded-full ring-1 ring-white/10" />
            )}
            <span className={`truncate ${homeWon ? 'font-black text-foreground' : home.name === 'TBD' || home.name.includes('Winner') ? 'font-medium text-muted-foreground italic' : 'font-semibold text-foreground/90'}`}>
              {home.name}
            </span>
          </div>
          {home.score !== null && (
            <span className={`font-black text-lg ml-2 ${homeWon ? 'text-primary' : 'text-muted-foreground'}`}>{home.score}</span>
          )}
        </div>

        {/* Away Team */}
        <div className={`flex items-center justify-between p-2.5 transition-colors ${awayWon ? 'bg-primary/5' : ''}`}>
          <div className="flex items-center gap-3 truncate">
            {away.flag ? (
              <img src={away.flag} alt={away.name} className="w-5 h-5 object-contain drop-shadow-sm" />
            ) : (
              <div className="w-5 h-5 bg-muted rounded-full ring-1 ring-white/10" />
            )}
            <span className={`truncate ${awayWon ? 'font-black text-foreground' : away.name === 'TBD' || away.name.includes('Winner') ? 'font-medium text-muted-foreground italic' : 'font-semibold text-foreground/90'}`}>
              {away.name}
            </span>
          </div>
          {away.score !== null && (
            <span className={`font-black text-lg ml-2 ${awayWon ? 'text-primary' : 'text-muted-foreground'}`}>{away.score}</span>
          )}
        </div>
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
      <div className="min-w-[1400px] p-8 md:p-12 flex gap-12 h-[1400px] relative">
        
        {/* Round of 32 */}
        <div className="flex flex-col justify-around flex-1 h-full z-10">
          <h3 className="text-center font-black tracking-widest text-sm text-primary/80 mb-6 uppercase">Round of 32</h3>
          {r32.map(game => <MatchBox key={game.id} game={game} roundIndex={0} />)}
        </div>

        {/* Round of 16 */}
        <div className="flex flex-col justify-around flex-1 h-full z-10">
          <h3 className="text-center font-black tracking-widest text-sm text-primary/80 mb-6 uppercase">Round of 16</h3>
          {r16.map(game => <MatchBox key={game.id} game={game} roundIndex={1} />)}
        </div>

        {/* Quarter-Finals */}
        <div className="flex flex-col justify-around flex-1 h-full z-10">
          <h3 className="text-center font-black tracking-widest text-sm text-primary/80 mb-6 uppercase">Quarter-Finals</h3>
          {qf.map(game => <MatchBox key={game.id} game={game} roundIndex={2} />)}
        </div>

        {/* Semi-Finals */}
        <div className="flex flex-col justify-around flex-1 h-full z-10">
          <h3 className="text-center font-black tracking-widest text-sm text-primary/80 mb-6 uppercase">Semi-Finals</h3>
          {sf.map(game => <MatchBox key={game.id} game={game} roundIndex={3} />)}
        </div>

        {/* Final & Third Place */}
        <div className="flex flex-col justify-center gap-40 flex-1 h-full relative z-10">
          <div className="flex flex-col gap-4 relative">
            <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full -z-10" />
            <h3 className="text-center font-black tracking-widest text-xl text-primary mb-2 uppercase drop-shadow-lg">🏆 Final</h3>
            {final.map(game => <MatchBox key={game.id} game={game} roundIndex={4} />)}
          </div>
          
          <div className="flex flex-col gap-4 mt-24">
            <h3 className="text-center font-bold tracking-widest text-sm text-muted-foreground mb-2 uppercase">🥉 Third Place</h3>
            {third.map(game => <MatchBox key={game.id} game={game} roundIndex={4} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
