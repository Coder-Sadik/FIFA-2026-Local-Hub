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

const matchNumberRegex = /Match (\d+)/i;

const getFeederIds = (game: Game): [string | null, string | null] => {
  const homeMatchId = game.home_team_label?.match(matchNumberRegex)?.[1] || null;
  const awayMatchId = game.away_team_label?.match(matchNumberRegex)?.[1] || null;
  return [homeMatchId, awayMatchId];
};

const getSubtreeIds = (rootId: string, allGames: Game[]): Set<string> => {
  const ids = new Set<string>();
  const traverse = (currentId: string) => {
    ids.add(currentId);
    const game = allGames.find(g => g.id === currentId);
    if (!game) return;
    const [h, a] = getFeederIds(game);
    if (h) traverse(h);
    if (a) traverse(a);
  };
  traverse(rootId);
  return ids;
};

const MatchBox = ({ game, side = 'left', isFinal = false, roundIndex = 0 }: { game: Game, side?: 'left' | 'right', isFinal?: boolean, roundIndex?: number }) => {
  if (!game) return null;
  const home = getTeamDisplay(game, 'home');
  const away = getTeamDisplay(game, 'away');

  let dateDisplay = game.local_date;
  try {
    const parsedDate = parse(game.local_date, 'MM/dd/yyyy HH:mm', new Date());
    dateDisplay = format(parsedDate, 'MMM d • HH:mm');
  } catch {}

  const isLive = game.finished === 'FALSE' && game.time_elapsed !== 'notstarted';
  const isFinished = game.finished === 'TRUE';
  
  const homeWon = isFinished && Number(home.score) > Number(away.score);
  const awayWon = isFinished && Number(away.score) > Number(home.score);

  // Calculate bracket fork height based on round
  // Container is fixed at 1040px height. R32=8 cards, so distance=130px.
  const forkHeights = ['0px', '130px', '260px', '520px'];
  const forkHeight = forkHeights[roundIndex] || '0px';

  return (
    <div className={`relative group shrink-0 ${isFinal ? 'w-64' : 'w-48'}`}>
      {/* --- CONNECTING LINES --- */}
      {!isFinal && (
        <>
          {/* Horizontal line going OUT to the next round */}
          <div className={`absolute top-1/2 w-4 h-px bg-border/50 ${side === 'left' ? '-right-4' : '-left-4'}`} />
          
          {/* Vertical Bracket Fork catching the previous round */}
          {roundIndex > 0 && (
             <div 
               className={`absolute top-1/2 -translate-y-1/2 w-4 border-y border-border/50 ${side === 'left' ? '-left-4 border-l' : '-right-4 border-r'}`}
               style={{ height: forkHeight }}
             />
          )}
        </>
      )}
      
      {/* --- FINAL CONNECTOR --- */}
      {isFinal && game.type === 'final' && (
         <>
           <div className="absolute top-1/2 w-6 h-px bg-border/50 -left-6" />
           <div className="absolute top-1/2 w-6 h-px bg-border/50 -right-6" />
         </>
      )}

      {/* --- CARD --- */}
      <div className={`relative z-10 bg-card border border-border shadow-sm rounded-md overflow-hidden flex flex-col text-xs transition-all duration-300 hover:shadow-md hover:border-primary/40 cursor-pointer`}>
        
        {/* Header */}
        <div className="bg-muted/40 text-muted-foreground text-[9px] tracking-wider uppercase font-bold text-center py-1 border-b border-border flex items-center justify-between px-2">
          <span>{isLive ? <span className="text-red-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/> LIVE {game.time_elapsed}&apos;</span> : dateDisplay}</span>
          <span className="opacity-50">M{game.id}</span>
        </div>
        
        {/* Home Team */}
        <div className={`flex items-center justify-between p-1.5 border-b border-border ${homeWon ? 'bg-primary/5' : ''}`}>
          <div className="flex items-center gap-2 truncate">
            {home.flag ? (
              <img src={home.flag} alt={home.name} className="w-4 h-4 object-contain" />
            ) : (
              <div className="w-4 h-4 bg-muted rounded-full" />
            )}
            <span className={`truncate ${homeWon ? 'font-bold text-foreground' : home.name === 'TBD' || home.name.includes('Winner') || home.name.includes('Runner') || home.name.includes('3rd') ? 'font-medium text-muted-foreground' : 'font-semibold text-foreground/90'}`}>
              {home.name}
            </span>
          </div>
          <span className={`font-bold ml-2 ${homeWon ? 'text-primary' : 'text-muted-foreground'}`}>{home.score ?? '-'}</span>
        </div>

        {/* Away Team */}
        <div className={`flex items-center justify-between p-1.5 ${awayWon ? 'bg-primary/5' : ''}`}>
          <div className="flex items-center gap-2 truncate">
            {away.flag ? (
              <img src={away.flag} alt={away.name} className="w-4 h-4 object-contain" />
            ) : (
              <div className="w-4 h-4 bg-muted rounded-full" />
            )}
            <span className={`truncate ${awayWon ? 'font-bold text-foreground' : away.name === 'TBD' || away.name.includes('Winner') || away.name.includes('Runner') || away.name.includes('3rd') ? 'font-medium text-muted-foreground' : 'font-semibold text-foreground/90'}`}>
              {away.name}
            </span>
          </div>
          <span className={`font-bold ml-2 ${awayWon ? 'text-primary' : 'text-muted-foreground'}`}>{away.score ?? '-'}</span>
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

  // Find Final
  const finalMatch = games.find(g => g.type === 'final');
  const thirdMatch = games.find(g => g.type === 'third');

  // Find SFs feeding into Final
  let leftSfId: string | null = null;
  let rightSfId: string | null = null;
  if (finalMatch) {
    [leftSfId, rightSfId] = getFeederIds(finalMatch);
  }

  // Left Side ordered logically
  const leftColumns = leftSfId ? buildColumnOrder(leftSfId, games) : [[], [], [], []];
  const leftSF = leftColumns[0];
  const leftQF = leftColumns[1];
  const leftR16 = leftColumns[2];
  const leftR32 = leftColumns[3];

  // Right Side ordered logically
  const rightColumns = rightSfId ? buildColumnOrder(rightSfId, games) : [[], [], [], []];
  const rightSF = rightColumns[0];
  const rightQF = rightColumns[1];
  const rightR16 = rightColumns[2];
  const rightR32 = rightColumns[3];

  return (
    <div className="w-full overflow-x-auto pb-12 cursor-grab active:cursor-grabbing scrollbar-hide bg-muted/10 p-4 md:p-8 rounded-3xl">
      <div className="min-w-[1200px] flex justify-center gap-8 relative h-[1040px]">
        
        {/* LEFT SIDE */}
        <div className="flex gap-8">
          <div className="flex flex-col justify-around z-10 w-48">
            {leftR32.map(game => <MatchBox key={game.id} game={game} side="left" roundIndex={0} />)}
          </div>
          <div className="flex flex-col justify-around z-10 w-48">
            {leftR16.map(game => <MatchBox key={game.id} game={game} side="left" roundIndex={1} />)}
          </div>
          <div className="flex flex-col justify-around z-10 w-48">
            {leftQF.map(game => <MatchBox key={game.id} game={game} side="left" roundIndex={2} />)}
          </div>
          <div className="flex flex-col justify-around z-10 w-48">
            {leftSF.map(game => <MatchBox key={game.id} game={game} side="left" roundIndex={3} />)}
          </div>
        </div>

        {/* CENTER FINAL */}
        <div className="flex flex-col justify-center items-center gap-16 z-10 w-64 px-4 border-x border-border/30 bg-background/50 backdrop-blur-sm shadow-2xl relative">
          {/* Subtle trophy glow */}
          <div className="absolute inset-0 bg-primary/5 blur-[80px] -z-10" />
          
          <div className="flex flex-col gap-2 w-full items-center relative">
            <h3 className="text-center font-black tracking-widest text-lg text-primary uppercase drop-shadow-md">🏆 Final</h3>
            {finalMatch && <MatchBox game={finalMatch} isFinal />}
          </div>
          <div className="flex flex-col gap-2 w-full items-center">
            <h3 className="text-center font-bold tracking-widest text-xs text-muted-foreground uppercase">🥉 3rd Place</h3>
            {thirdMatch && <MatchBox game={thirdMatch} isFinal />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex gap-8">
          <div className="flex flex-col justify-around z-10 w-48">
            {rightSF.map(game => <MatchBox key={game.id} game={game} side="right" roundIndex={3} />)}
          </div>
          <div className="flex flex-col justify-around z-10 w-48">
            {rightQF.map(game => <MatchBox key={game.id} game={game} side="right" roundIndex={2} />)}
          </div>
          <div className="flex flex-col justify-around z-10 w-48">
            {rightR16.map(game => <MatchBox key={game.id} game={game} side="right" roundIndex={1} />)}
          </div>
          <div className="flex flex-col justify-around z-10 w-48">
            {rightR32.map(game => <MatchBox key={game.id} game={game} side="right" roundIndex={0} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
