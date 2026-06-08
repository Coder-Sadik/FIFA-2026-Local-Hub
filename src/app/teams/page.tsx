import { getTeams } from '@/lib/api/worldcup26';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { getFlagUrl, getCountryColor } from '@/lib/countries';

export const metadata = {
  title: 'Teams | World Cup 2026 Hub',
};

export default async function TeamsPage() {
  const teams = await getTeams();
  
  // Group teams by their tournament group
  const groupedTeams = teams.reduce((acc, team) => {
    const group = team.groups || 'Unknown';
    if (!acc[group]) acc[group] = [];
    acc[group].push(team);
    return acc;
  }, {} as Record<string, typeof teams>);

  const sortedGroups = Object.keys(groupedTeams).sort();

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Participating Teams</h1>
        <p className="text-muted-foreground">All teams participating in the 2026 FIFA World Cup.</p>
      </div>

      <div className="space-y-12">
        {sortedGroups.map((group) => (
          <div key={group}>
            <h2 className="text-2xl font-bold mb-4 flex items-center border-b pb-2">
              Group {group}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupedTeams[group].map(team => {
                const teamColor = getCountryColor(team.name_en);
                const teamFlag = getFlagUrl(team.name_en, 'w160');
                
                return (
                  <Link key={team._id} href={`/team/${team.id}`}>
                    <Card 
                      className="hover:border-primary transition-colors cursor-pointer text-center h-full border-muted backdrop-blur-md"
                      style={{
                        background: `linear-gradient(to bottom right, ${teamColor}1A, rgba(0,0,0,0) 80%)`,
                        backgroundColor: 'hsl(var(--background) / 0.8)'
                      }}
                    >
                      <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl border-2 shadow-sm overflow-hidden" style={{ borderColor: teamColor }}>
                          {teamFlag ? (
                             <img src={teamFlag} alt={team.name_en} className="w-full h-full object-cover" />
                          ) : team.flag && team.flag.startsWith('http') ? (
                             <img src={team.flag} alt={team.name_en} className="w-full h-full object-cover" />
                          ) : (
                            team.name_en.charAt(0)
                          )}
                        </div>
                        <div className="font-bold text-sm tracking-tight drop-shadow-sm">
                          {team.name_en}
                        </div>
                        {team.fifa_ranking && team.fifa_ranking !== "null" && (
                          <div className="text-xs text-muted-foreground font-medium">
                            FIFA Rank: {team.fifa_ranking}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
