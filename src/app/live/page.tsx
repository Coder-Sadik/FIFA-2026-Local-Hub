import { getGames } from '@/lib/api/worldcup26';
import { LiveMatchesClient } from '@/components/features/LiveMatchesClient';
import { Radio } from 'lucide-react';

export const metadata = {
  title: 'Live Matches | FIFA 2026',
  description: 'Real-time live scores and upcoming fixtures for the FIFA World Cup 2026.',
};

export default async function LivePage() {
  const games = await getGames();

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-4xl md:text-5xl font-black flex items-center gap-4">
          <Radio className="h-10 w-10 text-primary" />
          Live Action
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Follow matches in real-time, or see exactly what&apos;s kicking off next.
        </p>
      </div>

      <LiveMatchesClient initialGames={games} />
    </div>
  );
}
