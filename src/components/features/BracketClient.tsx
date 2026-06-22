'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Game } from '@/types';
import { getFlagUrl } from '@/lib/countries';
import { format, parse } from 'date-fns';
import { Trophy } from 'lucide-react';

interface BracketClientProps {
  games: Game[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const getTeamDisplay = (game: Game, type: 'home' | 'away') => {
  const isHome = type === 'home';
  const id    = isHome ? game.home_team_id   : game.away_team_id;
  const label = isHome ? game.home_team_label : game.away_team_label;
  const name  = isHome ? game.home_team_name_en : game.away_team_name_en;
  const score = isHome ? game.home_score : game.away_score;

  if (id === '0' || !id || id === 'null') {
    return { name: label || 'TBD', flag: null, score: null };
  }
  return {
    name: name || 'TBD',
    flag: getFlagUrl(name || ''),
    score: game.finished === 'TRUE' ? score : null,
  };
};

const matchNumberRegex = /Match (\d+)/i;

const getFeederIds = (game: Game): [string | null, string | null] => {
  const homeMatchId = game.home_team_label?.match(matchNumberRegex)?.[1] || null;
  const awayMatchId = game.away_team_label?.match(matchNumberRegex)?.[1] || null;
  return [homeMatchId, awayMatchId];
};

const buildColumnOrder = (rootId: string, allGames: Game[]) => {
  const columns: Game[][] = [[], [], [], []];
  const visited = new Set<string>();
  const traverse = (currentId: string, depth: number) => {
    if (depth >= columns.length || visited.has(currentId)) return;
    const game = allGames.find(g => g.id === currentId);
    if (!game) return;
    visited.add(currentId);
    const [h, a] = getFeederIds(game);
    if (h) traverse(h, depth + 1);
    if (a) traverse(a, depth + 1);
    columns[depth].push(game);
  };
  traverse(rootId, 0);
  return columns;
};

// ── Round label strip ─────────────────────────────────────────────────────────
const RoundLabel = ({ label }: { label: string }) => (
  <div className="absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-0.5 rounded-full
    text-[10px] font-bold tracking-widest uppercase
    bg-white/5 border border-white/10 text-white/40 backdrop-blur-sm">
    {label}
  </div>
);

// ── Team Row ──────────────────────────────────────────────────────────────────
const TeamRow = ({
  name, flag, score, won, isTbd,
}: {
  name: string; flag: string | null; score: string | null; won: boolean; isTbd: boolean;
}) => (
  <div className={`
    flex items-center justify-between gap-2 px-2.5 py-1.5
    transition-colors duration-200
    ${won ? 'bg-white/[0.07]' : ''}
  `}>
    <div className="flex items-center gap-2 min-w-0">
      {flag ? (
        <img src={flag} alt={name} className="w-4 h-3 object-cover rounded-[2px] shrink-0 shadow-sm" />
      ) : (
        <div className="w-4 h-3 rounded-[2px] bg-white/10 shrink-0" />
      )}
      <span className={`text-[11px] truncate leading-tight
        ${isTbd         ? 'text-white/30 font-medium italic'
        : won           ? 'text-white font-bold'
                        : 'text-white/70 font-medium'}`}>
        {name}
      </span>
    </div>
    <span className={`text-[11px] font-black shrink-0 tabular-nums
      ${won ? 'text-emerald-400' : score !== null ? 'text-white/50' : 'text-white/20'}`}>
      {score ?? '–'}
    </span>
  </div>
);

// ── Match Box ─────────────────────────────────────────────────────────────────
const MatchBox = ({
  game,
  side = 'left',
  isFinal = false,
  roundIndex = 0,
}: {
  game: Game;
  side?: 'left' | 'right';
  isFinal?: boolean;
  roundIndex?: number;
}) => {
  if (!game) return null;

  const home = getTeamDisplay(game, 'home');
  const away = getTeamDisplay(game, 'away');

  let dateDisplay = game.local_date;
  try {
    const parsedDate = parse(game.local_date, 'MM/dd/yyyy HH:mm', new Date());
    dateDisplay = format(parsedDate, 'MMM d · HH:mm');
  } catch { /* ignore */ }

  const isLive     = game.finished === 'FALSE' && game.time_elapsed !== 'notstarted';
  const isFinished = game.finished === 'TRUE';
  const homeWon    = isFinished && Number(home.score) > Number(away.score);
  const awayWon    = isFinished && Number(away.score) > Number(home.score);
  const isTbdHome  = home.name === 'TBD' || home.name.includes('Winner') || home.name.includes('Runner') || home.name.includes('3rd');
  const isTbdAway  = away.name === 'TBD' || away.name.includes('Winner') || away.name.includes('Runner') || away.name.includes('3rd');

  // Connector fork heights per round depth (R32→SF)
  const forkHeights = ['0px', '130px', '260px', '520px'];
  const forkHeight  = forkHeights[roundIndex] || '0px';

  const w = isFinal ? 'w-60' : 'w-44';

  return (
    <div className={`relative group shrink-0 ${w}`}>

      {/* ── Connector lines ── */}
      {!isFinal && (
        <>
          {/* Horizontal stub to next round */}
          <div className={`absolute top-1/2 w-4 h-px bg-white/10 ${side === 'left' ? '-right-4' : '-left-4'}`} />
          {/* Vertical bracket fork */}
          {roundIndex > 0 && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-4 border-y border-white/10 ${side === 'left' ? '-left-4 border-l' : '-right-4 border-r'}`}
              style={{ height: forkHeight }}
            />
          )}
        </>
      )}
      {isFinal && game.type === 'final' && (
        <>
          <div className="absolute top-1/2 w-6 h-px bg-white/10 -left-6" />
          <div className="absolute top-1/2 w-6 h-px bg-white/10 -right-6" />
        </>
      )}

      {/* ── Glass card ── */}
      <div className={`
        relative z-10 rounded-xl overflow-hidden flex flex-col
        transition-all duration-300
        bg-white/[0.04] backdrop-blur-2xl
        border border-white/[0.08]
        shadow-[0_2px_16px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]
        hover:bg-white/[0.08]
        hover:border-white/[0.16]
        hover:shadow-[0_4px_32px_rgba(99,102,241,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]
        ${isLive ? 'border-red-500/30 shadow-[0_2px_16px_rgba(239,68,68,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]' : ''}
        ${isFinal ? 'bg-white/[0.06] border-indigo-400/20 shadow-[0_4px_32px_rgba(99,102,241,0.22),inset_0_1px_0_rgba(255,255,255,0.10)]' : ''}
      `}>

        {/* Specular highlight – top edge shimmer */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-2.5 py-1 border-b border-white/[0.06]">
          {isLive ? (
            <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE {game.time_elapsed}&apos;
            </span>
          ) : (
            <span className="text-[9px] tracking-wider text-white/30 font-medium">{dateDisplay}</span>
          )}
          <span className="text-[9px] text-white/20 font-mono">M{game.id}</span>
        </div>

        {/* Teams */}
        <div className="flex flex-col divide-y divide-white/[0.05]">
          <TeamRow name={home.name} flag={home.flag} score={home.score} won={homeWon} isTbd={isTbdHome} />
          <TeamRow name={away.name} flag={away.flag} score={away.score} won={awayWon} isTbd={isTbdAway} />
        </div>
      </div>
    </div>
  );
};

// ── Column wrapper with floating label ────────────────────────────────────────
const RoundColumn = ({
  games,
  label,
  side,
  roundIndex,
}: {
  games: Game[];
  label: string;
  side: 'left' | 'right';
  roundIndex: number;
}) => (
  <div className="relative flex flex-col justify-around z-10 w-44 pt-8">
    <RoundLabel label={label} />
    {games.map(game => (
      <MatchBox key={game.id} game={game} side={side} roundIndex={roundIndex} />
    ))}
  </div>
);

// ── Main export ───────────────────────────────────────────────────────────────
export function BracketClient({ games }: BracketClientProps) {
  const [mounted, setMounted] = useState(false);

  // ── Drag-to-scroll ──────────────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    dragState.current = {
      active: true,
      startX: e.pageX - scrollRef.current.offsetLeft,
      startY: e.pageY - scrollRef.current.offsetTop,
      scrollLeft: scrollRef.current.scrollLeft,
      scrollTop: scrollRef.current.scrollTop,
    };
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const ds = dragState.current;
    if (!ds.active || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const y = e.pageY - scrollRef.current.offsetTop;
    scrollRef.current.scrollLeft = ds.scrollLeft - (x - ds.startX);
    scrollRef.current.scrollTop  = ds.scrollTop  - (y - ds.startY);
  }, []);

  const stopDrag = useCallback(() => {
    dragState.current.active = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.userSelect = '';
    }
  }, []);
  // ───────────────────────────────────────────────────────────────────────────

  // eslint-disable-next-line
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Build tree
  const finalMatch = games.find(g => g.type === 'final');
  const thirdMatch  = games.find(g => g.type === 'third');

  let leftSfId:  string | null = null;
  let rightSfId: string | null = null;
  if (finalMatch) [leftSfId, rightSfId] = getFeederIds(finalMatch);

  const leftCols  = leftSfId  ? buildColumnOrder(leftSfId,  games) : [[], [], [], []];
  const rightCols = rightSfId ? buildColumnOrder(rightSfId, games) : [[], [], [], []];

  const [leftSF, leftQF, leftR16, leftR32]   = leftCols;
  const [rightSF, rightQF, rightR16, rightR32] = rightCols;

  const leftLabels  = ['Round of 32', 'Round of 16', 'Quarter-Final', 'Semi-Final'];
  const rightLabels = ['Semi-Final', 'Quarter-Final', 'Round of 16', 'Round of 32'];

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">

      {/* ── Floating header bar ── */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-3
        bg-white/[0.03] border-b border-white/[0.06] backdrop-blur-xl">
        <div className="p-2 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-400/20">
          <Trophy className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-widest uppercase text-white/90">
            Knockout Bracket
          </h1>
          <p className="text-[10px] text-white/30 tracking-wide">
            FIFA World Cup 2026 · Click &amp; drag to explore
          </p>
        </div>

        {/* Decorative ambient orbs in header */}
        <div className="ml-auto flex items-center gap-2 opacity-40">
          <div className="w-2 h-2 rounded-full bg-indigo-400 blur-[1px]" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 blur-[1px]" />
          <div className="w-1 h-1 rounded-full bg-violet-400 blur-[1px]" />
        </div>
      </div>

      {/* ── Scroll canvas ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto cursor-grab select-none"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {/* Extra ambient glows inside canvas */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px]" />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[60px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[60px]" />
        </div>

        <div className="w-max mx-auto flex gap-6 relative h-[1040px] px-8 py-10 items-stretch">

          {/* LEFT SIDE */}
          <div className="flex gap-6">
            {[leftR32, leftR16, leftQF, leftSF].map((col, i) => (
              <RoundColumn
                key={leftLabels[i]}
                games={col}
                label={leftLabels[i]}
                side="left"
                roundIndex={i}
              />
            ))}
          </div>

          {/* ── CENTER: Final + 3rd Place ── */}
          <div className="relative flex flex-col justify-center items-center gap-10 z-10 w-64 px-4 pt-8">
            {/* Vertical glass pillar */}
            <div className="absolute inset-0 rounded-3xl
              bg-white/[0.025] backdrop-blur-2xl
              border border-white/[0.07]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_60px_rgba(99,102,241,0.12)]" />
            {/* Top shimmer */}
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
            {/* Inner glow */}
            <div className="absolute inset-0 bg-radial-[at_50%_30%] from-indigo-500/10 to-transparent rounded-3xl" />

            <RoundLabel label="🏆 Final" />

            <div className="relative z-10 flex flex-col gap-10 w-full items-center">
              <div className="w-full flex flex-col items-center gap-2">
                {finalMatch && (
                  <MatchBox game={finalMatch} isFinal side="left" roundIndex={0} />
                )}
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="w-full flex flex-col items-center gap-2">
                <span className="text-[9px] font-bold tracking-widest uppercase text-white/25">🥉 3rd Place</span>
                {thirdMatch && (
                  <MatchBox game={thirdMatch} isFinal side="left" roundIndex={0} />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex gap-6">
            {[rightSF, rightQF, rightR16, rightR32].map((col, i) => (
              <RoundColumn
                key={rightLabels[i]}
                games={col}
                label={rightLabels[i]}
                side="right"
                roundIndex={3 - i}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
