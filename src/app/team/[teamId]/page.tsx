import { getTeams, getGames, getGroups } from '@/lib/api/worldcup26';
import { calculateAccurateStandings } from '@/lib/standings';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MatchCard } from '@/components/features/MatchCard';

import { getFlagUrl, getCountryColor } from '@/lib/countries';
import { FavoriteTeamButton } from '@/components/features/FavoriteTeamButton';

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const resolvedParams = await params;
  const [teams, games, groups] = await Promise.all([getTeams(), getGames(), getGroups()]);
  
  const team = teams.find(t => t.id === resolvedParams.teamId);
  if (!team) notFound();

  const teamGames = games.filter(g => g.home_team_id === team.id || g.away_team_id === team.id);
  
  // Calculate accurate standings due to API bug
  const accurateGroups = calculateAccurateStandings(groups, games);

  // Find group standing info
  const groupData = accurateGroups.find(g => g.name === team.groups);
  const standing = groupData?.teams.find((t: { team_id: string }) => t.team_id === team.id);

  const teamColor = getCountryColor(team.name_en);
  const teamFlag = getFlagUrl(team.name_en, 'w160');

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-6xl">
      {/* Team Header */}
      <div 
        className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 p-8 rounded-2xl border backdrop-blur-md shadow-sm relative overflow-hidden"
        style={{
          backgroundColor: 'hsl(var(--background) / 0.8)'
        }}
      >
        <div 
          className="absolute inset-0 z-0 opacity-50"
          style={{
            background: `linear-gradient(135deg, ${teamColor}40 0%, rgba(0,0,0,0) 100%)`,
          }}
        />
        
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 shadow-xl z-10 relative bg-background" style={{ borderColor: teamColor }}>
          {teamFlag ? (
            <img src={teamFlag} alt={team.name_en} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl">{team.name_en.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 text-center md:text-left space-y-4 z-10 relative">
          <div className="flex flex-col md:flex-row items-center md:items-baseline gap-4 justify-between">
            <h1 className="text-4xl md:text-6xl font-black">{team.name_en}</h1>
            <FavoriteTeamButton teamId={team.id} />
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div className="px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
              Group {team.groups}
            </div>
            {team.fifa_ranking && team.fifa_ranking !== "null" && (
              <div className="px-4 py-2 bg-muted rounded-full text-sm font-medium">
                FIFA Rank: {team.fifa_ranking}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Group */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Group {team.groups} Standing</CardTitle>
            </CardHeader>
            <CardContent>
              {standing ? (
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Points</span>
                    <span className="font-bold text-primary">{standing.pts}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Played</span>
                    <span className="font-medium">{standing.mp}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">W / D / L</span>
                    <span className="font-medium">{standing.w} / {standing.d} / {standing.l}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Goal Difference</span>
                    <span className="font-medium">{standing.gd}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Standings not available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Fixtures */}
        <div className="lg:col-span-2 space-y-12">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Team Fixtures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamGames.length > 0 ? (
                teamGames.map(game => (
                  <MatchCard key={game._id} game={game} />
                ))
              ) : (
                <p className="text-muted-foreground">No fixtures scheduled.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
