'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Game } from '@/types';
import { MatchCard } from '@/components/features/MatchCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePreferences } from '@/store/usePreferences';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FixturesClientProps {
  initialGames: Game[];
}

export function FixturesClient({ initialGames }: FixturesClientProps) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFavorites, setShowFavorites] = useState(false);
  const { favoriteTeams } = usePreferences();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const q = searchParams.get('q');
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  const filteredGames = useMemo(() => {
    return initialGames.filter((game) => {
      // Favorites Filter
      if (mounted && showFavorites) {
        if (!favoriteTeams.includes(game.home_team_id) && !favoriteTeams.includes(game.away_team_id)) {
          return false;
        }
      }

      // Search
      if (search) {
        const query = search.toLowerCase();
        const matchesSearch = 
          game.home_team_name_en?.toLowerCase().includes(query) ||
          game.away_team_name_en?.toLowerCase().includes(query) ||
          game.group?.toLowerCase().includes(query) ||
          game.stadium_id?.toString().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Group Filter
      if (groupFilter !== 'ALL' && game.group !== groupFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter !== 'ALL') {
        const isLive = game.finished === 'FALSE' && game.time_elapsed !== 'notstarted';
        const isFinished = game.finished === 'TRUE' || game.time_elapsed === 'finished';
        const isUpcoming = !isLive && !isFinished;
        
        if (statusFilter === 'LIVE' && !isLive) return false;
        if (statusFilter === 'UPCOMING' && !isUpcoming) return false;
        if (statusFilter === 'FINISHED' && !isFinished) return false;
      }

      return true;
    });
  }, [initialGames, search, groupFilter, statusFilter, showFavorites, favoriteTeams, mounted]);

  const uniqueGroups = Array.from(new Set(initialGames.map(g => g.group))).sort();

  return (
    <div className="space-y-8">
      {/* Filters Bar */}
      <div className="bg-muted/30 p-4 rounded-xl border flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative" suppressHydrationWarning>
          <Input 
            placeholder="Search teams, groups, or venues..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background pr-10"
            suppressHydrationWarning
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>
        
        <Select value={groupFilter} onValueChange={(val) => val && setGroupFilter(val)}>
          <SelectTrigger className="w-full md:w-[180px] bg-background">
            <SelectValue placeholder="All Groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Groups</SelectItem>
            {uniqueGroups.map(g => (
              <SelectItem key={g} value={g}>Group {g}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="LIVE">Live</TabsTrigger>
            <TabsTrigger value="UPCOMING">Upcoming</TabsTrigger>
            <TabsTrigger value="FINISHED">Finished</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {mounted && favoriteTeams.length > 0 && (
          <Button 
            variant={showFavorites ? "default" : "outline"}
            onClick={() => setShowFavorites(!showFavorites)}
            className={`gap-2 md:w-auto ${showFavorites ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent' : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'}`}
          >
            <Star className={`h-4 w-4 ${showFavorites ? 'fill-white' : 'fill-yellow-500'}`} />
            My Teams
          </Button>
        )}
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredGames.length} fixtures
        </p>
        {filteredGames.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No matches found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map(game => (
              <MatchCard key={game._id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
