import { getTeams, getGames, getGroups } from '@/lib/api/worldcup26';
import { getTeamIdByName, getTeamDetails, getTeamPlayers } from '@/lib/api/thesportsdb';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MatchCard } from '@/components/features/MatchCard';
import { MapPin, Users, Info, User } from 'lucide-react';

import { getFlagUrl, getCountryColor } from '@/lib/countries';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { FavoriteTeamButton } from '@/components/features/FavoriteTeamButton';

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const resolvedParams = await params;
  const [teams, games, groups] = await Promise.all([getTeams(), getGames(), getGroups()]);
  
  const team = teams.find(t => t.id === resolvedParams.teamId);
  if (!team) notFound();

  // Fetch TheSportsDB integration
  const idTeam = await getTeamIdByName(team.name_en);
  const sportsDbTeam = idTeam ? await getTeamDetails(idTeam) : null;
  const players = idTeam ? await getTeamPlayers(idTeam) : [];

  const teamGames = games.filter(g => g.home_team_id === team.id || g.away_team_id === team.id);
  
  // Find group standing info
  const groupData = groups.find(g => g.name === team.groups);
  const standing = groupData?.teams.find((t: { team_id: string }) => t.team_id === team.id);

  const teamColor = getCountryColor(team.name_en);
  const teamFlag = getFlagUrl(team.name_en, 'w160');
  
  // Try to use TheSportsDB banner/fanart for header background, fallback to teamColor
  const headerBg = sportsDbTeam?.strBanner || sportsDbTeam?.strFanart1;

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-6xl">
      {/* Team Header */}
      <div 
        className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 p-8 rounded-2xl border backdrop-blur-md shadow-sm relative overflow-hidden"
        style={{
          backgroundColor: 'hsl(var(--background) / 0.8)'
        }}
      >
        {headerBg && (
          <div 
            className="absolute inset-0 z-0 opacity-20"
            style={{
              backgroundImage: `url(${headerBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        <div 
          className="absolute inset-0 z-0 opacity-50"
          style={{
            background: `linear-gradient(135deg, ${teamColor}40 0%, rgba(0,0,0,0) 100%)`,
          }}
        />
        
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 shadow-xl z-10 relative bg-background" style={{ borderColor: teamColor }}>
          {sportsDbTeam?.strBadge ? (
            <img src={sportsDbTeam.strBadge} alt={team.name_en} className="w-3/4 h-3/4 object-contain" />
          ) : teamFlag ? (
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

          {/* External Details Card */}
          {sportsDbTeam && (
            <Card>
              <CardHeader>
                <CardTitle>Team Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sportsDbTeam.strKeywords && (
                    <div className="flex items-center gap-3 border-b pb-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Keywords</p>
                        <p className="text-sm font-semibold">{sportsDbTeam.strKeywords}</p>
                      </div>
                    </div>
                  )}
                  {sportsDbTeam.strStadium && (
                    <div className="flex items-center gap-3 border-b pb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Home Venue</p>
                        <p className="text-sm font-semibold">{sportsDbTeam.strStadium}</p>
                      </div>
                    </div>
                  )}
                  {sportsDbTeam.strDescriptionEN && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground font-medium mb-2">About</p>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                        {sportsDbTeam.strDescriptionEN}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Fixtures & Squad */}
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

          {/* Squad Roster */}
          {players.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Official Squad</h2>
                <Badge variant="secondary" className="ml-2">{players.length} Players</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {players.map(player => (
                  <Link href={`/player/${player.idPlayer}`} key={player.idPlayer}>
                    <Card className="hover:border-primary/50 transition-colors overflow-hidden group cursor-pointer h-full">
                      <div className="aspect-square bg-muted relative overflow-hidden flex items-end justify-center pt-4">
                        {player.strCutout ? (
                          <img 
                            src={player.strCutout} 
                            alt={player.strPlayer} 
                            className="object-contain h-[90%] w-full transform group-hover:scale-105 transition-transform drop-shadow-lg"
                          />
                        ) : player.strThumb ? (
                          <img 
                            src={player.strThumb} 
                            alt={player.strPlayer} 
                            className="object-cover h-full w-full opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        )}
                        {player.strNumber && (
                          <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-bold border">
                            {player.strNumber}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="font-semibold text-sm truncate">{player.strPlayer}</p>
                        <p className="text-xs text-muted-foreground truncate">{player.strPosition || 'Player'}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
