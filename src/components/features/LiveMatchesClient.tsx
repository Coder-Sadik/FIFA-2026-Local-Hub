'use client';

import { useMemo } from 'react';
import { Game } from '@/types';
import { fetchLiveGamesAction } from '@/app/actions/live';
import { MatchCard } from '@/components/features/MatchCard';
import { CountdownTimer } from '@/components/features/CountdownTimer';
import { CalendarDays, Radio } from 'lucide-react';
import { LocalTime } from '@/components/ui/local-time';
import { useQuery } from '@tanstack/react-query';
import { parse } from 'date-fns';

interface LiveMatchesClientProps {
  initialGames: Game[];
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function LiveMatchesClient({ initialGames }: LiveMatchesClientProps) {
  const { data: games = initialGames } = useQuery({
    queryKey: ['liveGames'],
    queryFn: async () => {
      const freshGames = await fetchLiveGamesAction();
      return freshGames && freshGames.length > 0 ? freshGames : initialGames;
    },
    initialData: initialGames,
    refetchInterval: 30000, // Poll every 30s
  });

  // Pre-calculate timestamps to avoid doing it repeatedly in sorting/filtering
  const gamesWithTimestamps = useMemo(() => {
    return games.map(game => {
      // Date format is likely "MM/DD/YYYY HH:mm" based on previous manual split
      let timestamp = 0;
      try {
        const parsedDate = parse(game.local_date, 'MM/dd/yyyy HH:mm', new Date());
        timestamp = parsedDate.getTime();
      } catch {
        // Fallback to naive parse if date format is slightly different
        timestamp = new Date(game.local_date).getTime();
      }
      return { ...game, timestamp };
    });
  }, [games]);

  const { liveGames, upcomingToday, nextMatches } = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const live = gamesWithTimestamps.filter(g => g.finished === 'FALSE' && g.time_elapsed !== 'notstarted');
    
    // Sort notstarted games chronologically
    const notStarted = gamesWithTimestamps
      .filter(g => g.finished === 'FALSE' && g.time_elapsed === 'notstarted' && g.timestamp > now - 4 * 60 * 60 * 1000)
      .sort((a, b) => a.timestamp - b.timestamp);

    // Upcoming within 24 hours of "now" (simulated "today" logic)
    const today = notStarted.filter(g => {
      return g.timestamp > now && g.timestamp < now + ONE_DAY_MS;
    });

    // Up Next: Find the timestamp of the very next match, then get ALL matches that start at that exact time
    let next: typeof gamesWithTimestamps = [];
    if (notStarted.length > 0) {
      const nextTimestamp = notStarted[0].timestamp;
      next = notStarted.filter(g => g.timestamp === nextTimestamp);
    }

    return { liveGames: live, upcomingToday: today, nextMatches: next };
  }, [gamesWithTimestamps]);

  return (
    <div className="space-y-12">
      
      {/* SECTION A: Live Games Hero */}
      {liveGames.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Radio className="h-6 w-6 text-red-500 animate-pulse" />
            <h2 className="text-3xl font-black text-red-500">LIVE NOW</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveGames.map(game => (
              <div key={game._id} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <MatchCard game={game} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION C: Empty State (If no live games) */}
      {liveGames.length === 0 && (
        <section className="bg-muted/30 border rounded-2xl p-8 text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">No matches are currently live</h3>
            <p className="text-muted-foreground">The action will return soon. Stay tuned!</p>
          </div>
          
          {nextMatches.length > 0 && (
            <div className="mt-8 mx-auto w-full max-w-4xl">
              <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">
                Up Next {nextMatches.length > 1 ? `(${nextMatches.length} Matches)` : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
                {nextMatches.map(match => (
                  <div key={match._id} className="text-left flex flex-col items-center">
                    <div className="w-full">
                      <MatchCard game={match} />
                    </div>
                    <div className="mt-4 p-3 bg-background rounded-lg border inline-block text-sm shadow-sm">
                      <CountdownTimer dateStr={match.local_date} stadiumId={match.stadium_id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECTION B: Upcoming Today */}
      {upcomingToday.length > 0 && (
        <section className="space-y-6 pt-8 border-t">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Starting Next 24h</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingToday.map(game => (
              <div key={game._id} className="space-y-3">
                <MatchCard game={game} />
                <div className="flex justify-between px-2 text-sm">
                  <CountdownTimer dateStr={game.local_date} stadiumId={game.stadium_id} />
                  <span className="text-muted-foreground">
                    <LocalTime date={game.local_date} format="time" stadiumId={game.stadium_id} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
