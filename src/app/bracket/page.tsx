import { getGames } from '@/lib/api/worldcup26';
import { BracketClient } from '@/components/features/BracketClient';

export const metadata = {
  title: 'Knockout Bracket | FIFA 2026',
  description: 'Interactive Knockout Stage Bracket for the 2026 FIFA World Cup.',
};

export default async function BracketPage() {
  const games = await getGames();

  return (
    /* Full-screen: fills viewport height minus the navbar */
    <div className="relative w-full" style={{ height: 'calc(100dvh - 64px)' }}>
      {/* ── Deep ambient background ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(16,185,129,0.10),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* ── Bracket fills 100% ── */}
      <BracketClient games={games} />
    </div>
  );
}

