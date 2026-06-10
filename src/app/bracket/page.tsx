import { getGames } from '@/lib/api/worldcup26';
import { BracketClient } from '@/components/features/BracketClient';
import { Trophy } from 'lucide-react';

export const metadata = {
  title: 'Knockout Bracket | FIFA 2026',
  description: 'Interactive Knockout Stage Bracket for the 2026 FIFA World Cup.',
};

export default async function BracketPage() {
  const games = await getGames();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
            Knockout Bracket
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Trace the path to the final across the massive 32-team elimination stage. 
          Swipe horizontally to explore the full bracket!
        </p>
      </div>

      <div className="bg-muted/10 border rounded-2xl overflow-hidden shadow-inner">
        <BracketClient games={games} />
      </div>
    </div>
  );
}
