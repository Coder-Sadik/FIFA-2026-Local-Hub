import { getPlayerDetails, getTeamDetails } from '@/lib/api/thesportsdb';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, CalendarDays, MapPin, DollarSign, Facebook, Twitter, Instagram, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PlayerPage({ params }: { params: Promise<{ playerId: string }> }) {
  const resolvedParams = await params;
  const player = await getPlayerDetails(resolvedParams.playerId);
  if (!player) notFound();

  const team = await getTeamDetails(player.idTeam);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Link href="/fixtures" className="inline-block mb-6">
        <Button variant="ghost" className="gap-2 -ml-4">
          <ArrowLeft className="h-4 w-4" /> Back to Fixtures
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Image & Quick Stats */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-2 border-primary/20 bg-muted/30">
            <div className="aspect-[3/4] relative flex items-end justify-center pt-8 bg-gradient-to-t from-background to-transparent">
              {player.strCutout ? (
                <img 
                  src={player.strCutout} 
                  alt={player.strPlayer} 
                  className="object-contain h-[95%] w-full drop-shadow-2xl z-10"
                />
              ) : player.strThumb ? (
                <img 
                  src={player.strThumb} 
                  alt={player.strPlayer} 
                  className="object-cover h-full w-full"
                />
              ) : (
                <User className="h-32 w-32 text-muted-foreground/30 mb-12" />
              )}
            </div>
            <CardContent className="p-6 bg-card space-y-4 border-t">
              <div className="flex items-center justify-between">
                <Badge variant="default" className="text-lg px-3 py-1">
                  #{player.strNumber || '?'}
                </Badge>
                <span className="font-semibold text-muted-foreground">{player.strPosition}</span>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                {player.strNationality && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{player.strNationality}</span>
                  </div>
                )}
                {player.dateBorn && (
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Born: {player.dateBorn}</span>
                  </div>
                )}
                {player.strWage && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{player.strWage}</span>
                  </div>
                )}
              </div>

              {/* Socials */}
              <div className="flex items-center gap-2 pt-4 border-t">
                {player.strFacebook && (
                  <a href={`https://${player.strFacebook}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-blue-600 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {player.strTwitter && (
                  <a href={`https://${player.strTwitter}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-blue-400 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {player.strInstagram && (
                  <a href={`https://${player.strInstagram}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-pink-600 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bio */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl md:text-5xl font-black">{player.strPlayer}</h1>
            </div>
            {team && (
              <div className="flex items-center gap-3 text-lg text-muted-foreground">
                {team.strBadge && <img src={team.strBadge} alt={team.strTeam} className="w-6 h-6 object-contain" />}
                <span className="font-semibold">{team.strTeam}</span>
              </div>
            )}
          </div>

          {player.strDescriptionEN ? (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {player.strDescriptionEN}
              </p>
            </div>
          ) : (
            <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed">
              <p className="text-muted-foreground">No detailed biography available for this player.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
