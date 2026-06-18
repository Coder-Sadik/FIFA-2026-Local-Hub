import { getGames } from '@/lib/api/worldcup26';
import { getAbsoluteGameDate } from '@/lib/timezone';
import { MatchCard } from '@/components/features/MatchCard';
import { FavoriteMatches } from '@/components/features/FavoriteMatches';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, Activity } from 'lucide-react';

export default async function Home() {
  const allGames = await getGames();
  
  const now = Date.now();
  const liveGames = allGames.filter(g => g.finished === 'FALSE' && g.time_elapsed !== 'notstarted');
  const upcomingGames = allGames.filter(g => {
    if (g.time_elapsed !== 'notstarted') return false;
    const gameTime = getAbsoluteGameDate(g.local_date, g.stadium_id).getTime();
    return gameTime > now - 4 * 60 * 60 * 1000;
  }).slice(0, 6);
  const finishedGames = allGames.filter(g => g.finished === 'TRUE' || g.time_elapsed === 'finished').reverse().slice(0, 3);

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-emerald-900 to-blue-900 opacity-80" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518605368461-1ee125232938?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white space-y-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase drop-shadow-lg">
            World Cup 2026
          </h1>
          <p className="text-xl md:text-2xl font-light text-white/90 max-w-2xl mx-auto drop-shadow-md">
            The ultimate hub for live scores, fixtures, and group standings across all 104 matches.
          </p>
          <div className="pt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/fixtures" className={buttonVariants({ size: "lg", className: "bg-primary hover:bg-primary/90 text-primary-foreground font-bold w-full sm:w-auto" })}>
              View All Fixtures <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/bracket" className={buttonVariants({ size: "lg", variant: "secondary", className: "w-full sm:w-auto font-bold" })}>
              Knockout Bracket
            </Link>
            <Link href="/standings" className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 text-white" })}>
              Group Standings
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 space-y-16">
        
        {/* User's Favorite Teams Matches */}
        <FavoriteMatches allGames={allGames} />

        {/* Live Matches Section */}
        {liveGames.length > 0 && (
          <section>
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="h-6 w-6 text-red-500 animate-pulse" />
              <h2 className="text-2xl font-bold tracking-tight">Live Matches</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveGames.map(game => (
                <MatchCard key={game._id} game={game} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Upcoming Fixtures</h2>
            <Link href="/fixtures" className={buttonVariants({ variant: "ghost" })}>View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingGames.map(game => (
              <MatchCard key={game._id} game={game} />
            ))}
          </div>
        </section>

        {/* Recent Results */}
        {finishedGames.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedGames.map(game => (
                <MatchCard key={game._id} game={game} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
