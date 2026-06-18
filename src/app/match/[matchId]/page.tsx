import { getGames, getStadiums } from '@/lib/api/worldcup26';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocalTime } from '@/components/ui/local-time';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, TypeIcon as Goal } from 'lucide-react';
import { parseScorersStr } from '@/lib/scorers';
import { getAbsoluteGameDate } from '@/lib/timezone';

export default async function MatchDetailsPage({ params }: { params: { matchId: string } }) {
  const [games, stadiums] = await Promise.all([getGames(), getStadiums()]);
  const game = games.find(g => g.id === params.matchId);

  if (!game) {
    notFound();
  }

  const stadium = stadiums.find(s => s.id === game.stadium_id);
  const isLive = game.finished === 'FALSE' && game.time_elapsed !== 'notstarted';
  let isFinished = game.finished === 'TRUE' || game.time_elapsed === 'finished';

  if (!isLive && !isFinished) {
    const gameTime = getAbsoluteGameDate(game.local_date, game.stadium_id).getTime();
    if (gameTime < Date.now() - 4 * 60 * 60 * 1000) {
      isFinished = true;
    }
  }

  const homeScorers = parseScorersStr(game.home_scorers, 'home');
  const awayScorers = parseScorersStr(game.away_scorers, 'away');
  const allScorers = [...homeScorers, ...awayScorers].sort((a, b) => a.minute - b.minute);

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-5xl">
      {/* Header Match Overview */}
      <Card className="mb-8 border-none bg-gradient-to-br from-blue-900/40 via-emerald-900/20 to-background overflow-hidden relative">
        <div className="absolute top-4 right-4">
          <Button variant="outline" size="sm" className="bg-background/50 backdrop-blur">
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
        </div>
        <CardContent className="pt-12 pb-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-4xl md:text-5xl font-black">{game.home_team_name_en}</div>
          </div>
          
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <Badge variant={isLive ? "destructive" : "secondary"} className="mb-2 text-sm px-3 py-1">
              {isLive ? `LIVE ${game.time_elapsed}'` : isFinished ? 'FULL TIME' : 'UPCOMING'}
            </Badge>
            <div className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              {isFinished || isLive ? `${game.home_score} - ${game.away_score}` : 'VS'}
            </div>
            <div className="text-muted-foreground font-medium mt-4">
              <LocalTime date={game.local_date} format="long" stadiumId={game.stadium_id} />
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-4xl md:text-5xl font-black">{game.away_team_name_en}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Match Events</CardTitle>
            </CardHeader>
            <CardContent>
              {isFinished || isLive ? (
                allScorers.length > 0 ? (
                  <div className="relative border-l-2 border-border ml-4 md:ml-1/2 md:translate-x-[calc(50%-1px)] space-y-8 py-4">
                    {allScorers.map((scorer, i) => (
                      <div key={i} className={`relative flex items-center md:w-[200vw] md:-ml-[100vw] ${scorer.team === 'home' ? 'md:justify-start' : 'md:justify-end'}`}>
                        {/* Dot indicator */}
                        <div className="absolute left-[-9px] md:left-1/2 md:-ml-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-background z-10" />
                        
                        {/* Content */}
                        <div className={`w-full md:w-1/2 flex items-center gap-4 pl-8 md:pl-0 ${scorer.team === 'home' ? 'md:pr-12 md:justify-end md:flex-row' : 'md:pl-12 md:flex-row-reverse md:justify-end'}`}>
                          <div className={`flex flex-col ${scorer.team === 'home' ? 'md:text-right' : 'text-left md:text-left'}`}>
                            <span className="font-bold">{scorer.name}</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1 mt-1 justify-start md:justify-end">
                              <Goal className="w-3 h-3 text-primary" /> {scorer.time} {scorer.isPenalty && '(Penalty)'} {scorer.isOwnGoal && '(Own Goal)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No goals recorded for this match.</div>
                )
              ) : (
                <div className="text-center py-12 text-muted-foreground">Match has not started yet.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Match Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Tournament</span>
                <span className="font-medium">FIFA World Cup 2026™</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Stage</span>
                <span className="font-medium">Group {game.group} - Matchday {game.matchday}</span>
              </div>
              {stadium && (
                <>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Stadium</span>
                    <span className="font-medium text-right">{stadium.name_en}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">City</span>
                    <span className="font-medium">{stadium.city_en}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Prediction voting opens 48 hours before kickoff.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
