import { getTeams, getGames, getGroups } from '@/lib/api/worldcup26';
import { getTeamDetails } from '@/lib/api/thestatsapi';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MatchCard } from '@/components/features/MatchCard';
import { Star, MapPin, Calendar, User, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFlagUrl, getCountryColor } from '@/lib/countries';

export default async function TeamPage({ params }: { params: { teamId: string } }) {
  const [teams, games, groups] = await Promise.all([getTeams(), getGames(), getGroups()]);
  
  const team = teams.find(t => t.id === params.teamId);
  if (!team) notFound();

  // Fetch external details from thestatsapi
  const externalDetailsRes = await getTeamDetails(team.name_en);
  const externalTeam = externalDetailsRes?.data?.[0] || externalDetailsRes?.response?.[0] || null;


  const teamGames = games.filter(g => g.home_team_id === team.id || g.away_team_id === team.id);
  
  // Find group standing info
  const groupData = groups.find(g => g.name === team.groups);
  const standing = groupData?.teams.find((t: any) => t.team_id === team.id);

  const teamColor = getCountryColor(team.name_en);
  const teamFlag = getFlagUrl(team.name_en, 'w160');

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-6xl">
      {/* Team Header */}
      <div 
        className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 p-8 rounded-2xl border backdrop-blur-md shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${teamColor}20 0%, rgba(0,0,0,0) 100%)`,
          backgroundColor: 'hsl(var(--background) / 0.8)'
        }}
      >
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 shadow-xl" style={{ borderColor: teamColor }}>
          {teamFlag ? (
            <img src={teamFlag} alt={team.name_en} className="w-full h-full object-cover" />
          ) : team.flag && team.flag.startsWith('http') ? (
            <img src={team.flag} alt={team.name_en} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl">{team.name_en.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row items-center md:items-baseline gap-4 justify-between">
            <h1 className="text-4xl md:text-6xl font-black">{team.name_en}</h1>
            <Button variant="outline" className="gap-2">
              <Star className="h-4 w-4" /> Add to Favorites
            </Button>
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

          {/* External Details Card */}
          {externalTeam && (
            <Card>
              <CardHeader>
                <CardTitle>Team Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {externalTeam.founded && (
                    <div className="flex items-center gap-3 border-b pb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Founded</p>
                        <p className="text-sm font-semibold">{externalTeam.founded}</p>
                      </div>
                    </div>
                  )}
                  {(externalTeam.manager || externalTeam.coach) && (
                    <div className="flex items-center gap-3 border-b pb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Manager</p>
                        <p className="text-sm font-semibold">{externalTeam.manager || externalTeam.coach}</p>
                      </div>
                    </div>
                  )}
                  {(externalTeam.venue || externalTeam.stadium) && (
                    <div className="flex items-center gap-3 border-b pb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Home Venue</p>
                        <p className="text-sm font-semibold">{externalTeam.venue || externalTeam.stadium}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Fixtures */}
        <div className="lg:col-span-2 space-y-6">
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
  );
}
