import { getGames } from '@/lib/api/worldcup26';
import { FixturesClient } from '@/components/features/FixturesClient';
import { Suspense } from 'react';

export const metadata = {
  title: 'All Fixtures | World Cup 2026 Hub',
  description: 'Explore all FIFA World Cup 2026 fixtures, live scores, and past match results. Filter by team, group, and status.',
};

export default async function FixturesPage() {
  const games = await getGames();

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Match Fixtures</h1>
        <p className="text-muted-foreground">Browse the complete schedule for the 2026 tournament.</p>
      </div>
      <Suspense fallback={<div className="container mx-auto px-4 md:px-8 py-8 animate-pulse"><div className="h-10 w-full bg-muted rounded-md mb-8"></div></div>}>
        <FixturesClient initialGames={games} />
      </Suspense>
    </div>
  );
}
