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
    <div className="relative min-h-screen bg-background pb-12 overflow-hidden">
      {/* Tactical Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

      <div className="relative container mx-auto px-4 py-8 md:py-12 max-w-7xl z-10">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20 backdrop-blur">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Knockout Bracket
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Trace the path to the final across the massive 32-team elimination stage. 
            Swipe horizontally to explore the full tournament tree.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
          <BracketClient games={games} />
        </div>
      </div>
    </div>
  );
}
