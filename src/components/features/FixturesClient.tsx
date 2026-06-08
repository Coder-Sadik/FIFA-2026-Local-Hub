'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Game } from '@/types';
import { MatchCard } from '@/components/features/MatchCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FixturesClientProps {
  initialGames: Game[];
}

export function FixturesClient({ initialGames }: FixturesClientProps) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  const filteredGames = useMemo(() => {
    return initialGames.filter((game) => {
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
  }, [initialGames, search, groupFilter, statusFilter]);

  const uniqueGroups = Array.from(new Set(initialGames.map(g => g.group))).sort();

  return (
    <div className="space-y-8">
      {/* Filters Bar */}
      <div className="bg-muted/30 p-4 rounded-xl border flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search teams, groups, or venues..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background"
          />
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
