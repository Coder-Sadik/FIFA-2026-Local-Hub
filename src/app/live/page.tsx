import { getGames } from '@/lib/api/worldcup26';
import { LiveMatchesClient } from '@/components/features/LiveMatchesClient';
import { LiveStreamSection } from '@/components/features/LiveStreamSection';
import { AutoRefresh } from '@/components/features/AutoRefresh';
import { Radio } from 'lucide-react';

export const metadata = {
  title: 'Live Matches | FIFA 2026',
  description: 'Real-time live scores and upcoming fixtures for the FIFA World Cup 2026.',
};

export default async function LivePage() {
  const games = await getGames();

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-7xl">
      {/* 30 s normal refresh; on API-404 retry every 5 s until data returns */}
      <AutoRefresh interval={30_000} triggerOnEmpty={games.length === 0} emptyRetryDelay={5_000} />
      <div className="mb-8 border-b pb-6">
        <h1 className="text-4xl md:text-5xl font-black flex items-center gap-4">
          <Radio className="h-10 w-10 text-primary animate-pulse" />
          Live Action
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Watch global sports streams and follow World Cup matches in real-time.
        </p>
      </div>

      <LiveStreamSection />

      <div className="mb-8">
         <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Radio className="w-6 h-6 text-primary" />
          Live Scores & Upcoming
        </h2>
        <LiveMatchesClient initialGames={games} />
      </div>
    </div>
  );
}
