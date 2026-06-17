import { getGroups, getTeams, getGames } from '@/lib/api/worldcup26';
import { calculateAccurateStandings } from '@/lib/standings';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Group Standings | World Cup 2026 Hub',
};

export default async function StandingsPage() {
  const [rawGroups, teams, games] = await Promise.all([getGroups(), getTeams(), getGames()]);
  
  // The API's 'groups' endpoint has a bug where it maps scores to W/D/L incorrectly (e.g., 3-1 win sets W to 3)
  // We calculate the accurate standings client-side from the source-of-truth games array
  const accurateGroups = calculateAccurateStandings(rawGroups, games);

  // Sort groups alphabetically by name (A, B, C...)
  const sortedGroups = [...accurateGroups].sort((a, b) => a.name.localeCompare(b.name));

  // O(N) setup for fast lookup
  const teamMap = new Map(teams.map(t => [t.id, t.name_en]));

  const getTeamName = (id: string) => {
    return teamMap.get(id) || `Team ${id}`;
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Group Standings</h1>
        <p className="text-muted-foreground">Current standings across all groups in the tournament.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sortedGroups.map((group) => (
          <Card key={group._id} className="bg-background/50 backdrop-blur border-primary/20">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle>Group {group.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px] text-center">Pos</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">MP</TableHead>
                    <TableHead className="text-center">W</TableHead>
                    <TableHead className="text-center">D</TableHead>
                    <TableHead className="text-center">L</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">GD</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Sort teams by pts, then gd, then gf */}
                  {[...group.teams]
                    .sort((a, b) => {
                      if (b.pts !== a.pts) return Number(b.pts) - Number(a.pts);
                      if (b.gd !== a.gd) return Number(b.gd) - Number(a.gd);
                      return Number(b.gf) - Number(a.gf);
                    })
                    .map((team, index) => (
                    <TableRow key={team._id} className={index < 2 ? 'bg-primary/5' : ''}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="font-bold">{getTeamName(team.team_id)}</TableCell>
                      <TableCell className="text-center">{team.mp}</TableCell>
                      <TableCell className="text-center">{team.w}</TableCell>
                      <TableCell className="text-center">{team.d}</TableCell>
                      <TableCell className="text-center">{team.l}</TableCell>
                      <TableCell className="text-center hidden sm:table-cell">{team.gd}</TableCell>
                      <TableCell className="text-center font-bold text-primary text-lg">{team.pts}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
