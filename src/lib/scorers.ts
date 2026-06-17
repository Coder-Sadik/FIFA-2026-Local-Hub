import { Game } from '@/types';

export interface Scorer {
  name: string;
  time: string;
  minute: number;
  raw: string;
  team: 'home' | 'away';
  isPenalty: boolean;
  isOwnGoal: boolean;
}

export function parseScorersStr(str: string | undefined | null, team: 'home' | 'away'): Scorer[] {
  if (!str || str === 'null' || str === '{}') return [];
  
  const clean = str.replace(/^{|}$/g, '');
  if (!clean) return [];
  
  const items = clean.split('","').map(i => i.replace(/^"|"$/g, ''));
  
  return items.map(item => {
    const isPenalty = item.includes('(P)');
    const isOwnGoal = item.includes('(OG)');
    
    // Usually "Name Time", e.g., "Rvmanv Ashmid 21'" or "John Doe 90+2'(P)"
    const match = item.match(/^(.*?)\s+((?:\d+(?:\+\d+)?')(?:.*?))$/);
    
    let name = item;
    let time = '';
    let minute = 0;
    
    if (match) {
      name = match[1].trim();
      time = match[2].trim();
      
      // Extract main minute for sorting (e.g. "90+2'" -> 90)
      const minMatch = time.match(/^(\d+)/);
      if (minMatch) {
        minute = parseInt(minMatch[1], 10);
      }
    }
    
    return {
      name,
      time,
      minute,
      raw: item,
      team,
      isPenalty,
      isOwnGoal
    };
  });
}

export interface PlayerStats {
  name: string;
  goals: number;
  penalties: number;
  teamId: string;
  teamName: string;
}

export function computeTopScorers(games: Game[]): PlayerStats[] {
  const statsMap = new Map<string, PlayerStats>();

  games.forEach(game => {
    if (game.finished !== 'TRUE' && game.time_elapsed !== 'finished') return;

    const processScorers = (scorersStr: string, teamId: string, teamName: string) => {
      const parsed = parseScorersStr(scorersStr, 'home'); // team literal doesn't matter here
      parsed.forEach(scorer => {
        if (scorer.isOwnGoal) return; // Own goals don't count towards Golden Boot for the player

        // We use player name as key since there are no player IDs in this API
        const key = scorer.name;
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            name: scorer.name,
            goals: 0,
            penalties: 0,
            teamId,
            teamName
          });
        }

        const stats = statsMap.get(key)!;
        stats.goals += 1;
        if (scorer.isPenalty) {
          stats.penalties += 1;
        }
      });
    };

    processScorers(game.home_scorers, game.home_team_id, game.home_team_name_en);
    processScorers(game.away_scorers, game.away_team_id, game.away_team_name_en);
  });

  // Convert map to array and sort by goals (desc), then penalties (asc - less penalties means higher rank), then name (asc)
  return Array.from(statsMap.values()).sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (a.penalties !== b.penalties) return a.penalties - b.penalties;
    return a.name.localeCompare(b.name);
  });
}
