import { getGames } from '@/lib/api/worldcup26';
import { computeTopScorers } from '@/lib/scorers';
import { getFlagUrl } from '@/lib/countries';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export const metadata = {
  title: 'Golden Boot | Top Scorers FIFA 2026',
};

export default async function TopScorersPage() {
  const games = await getGames();
  const topScorers = computeTopScorers(games);
  
  // Show only players who have scored at least 1 goal, up to top 50
  const displayScorers = topScorers.filter(s => s.goals > 0).slice(0, 50);

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20 backdrop-blur">
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Golden Boot</h1>
          <p className="text-muted-foreground">Top goalscorers of the 2026 FIFA World Cup.</p>
        </div>
      </div>

      <Card className="bg-background/50 backdrop-blur border-primary/20 shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px] text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Goals</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Penalties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayScorers.length > 0 ? (
                displayScorers.map((scorer, index) => {
                  const flag = getFlagUrl(scorer.teamName);
                  const isTopThree = index < 3;
                  
                  return (
                    <TableRow key={`${scorer.name}-${scorer.teamId}`} className={index === 0 ? 'bg-yellow-500/10' : index === 1 ? 'bg-slate-300/10' : index === 2 ? 'bg-amber-700/10' : ''}>
                      <TableCell className="text-center">
                        <span className={`font-bold ${index === 0 ? 'text-yellow-500 text-lg' : index === 1 ? 'text-slate-300 text-lg' : index === 2 ? 'text-amber-600 text-lg' : 'text-muted-foreground'}`}>
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell className={`font-bold ${isTopThree ? 'text-foreground' : ''}`}>
                        {scorer.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {flag ? (
                            <img src={flag} alt={scorer.teamName} className="w-5 h-5 object-contain" />
                          ) : (
                            <div className="w-5 h-5 bg-muted rounded-full" />
                          )}
                          <span className="hidden sm:inline font-medium">{scorer.teamName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-black text-xl text-primary">
                        {scorer.goals}
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell text-muted-foreground">
                        {scorer.penalties}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No goalscorers found yet. Check back after the first match!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
