import { Game, Team, Stadium, Group } from '@/types';

const BASE_URL = 'https://worldcup26.ir/get';

// Revalidate static data every hour (3600 seconds)
// This significantly reduces API calling costs.
export async function getGames(): Promise<Game[]> {
  const res = await fetch(`${BASE_URL}/games`, {
    next: { revalidate: 60 }, // Revalidate every minute for live results
  });
  if (!res.ok) throw new Error('Failed to fetch games');
  const data = await res.json();
  const games: Game[] = data.games || [];
  
  return games.sort((a, b) => {
    return new Date(a.local_date).getTime() - new Date(b.local_date).getTime();
  });
}

export async function getTeams(): Promise<Team[]> {
  const res = await fetch(`${BASE_URL}/teams`, {
    next: { revalidate: 3600 * 24 }, // Daily
  });
  if (!res.ok) throw new Error('Failed to fetch teams');
  const data = await res.json();
  return data.teams || [];
}

export async function getStadiums(): Promise<Stadium[]> {
  const res = await fetch(`${BASE_URL}/stadiums`, {
    next: { revalidate: 3600 * 24 * 7 }, // Weekly
  });
  if (!res.ok) throw new Error('Failed to fetch stadiums');
  const data = await res.json();
  return data.stadiums || [];
}

export async function getGroups(): Promise<Group[]> {
  const res = await fetch(`${BASE_URL}/groups`, {
    next: { revalidate: 60 }, // Revalidate every minute for live standings
  });
  if (!res.ok) throw new Error('Failed to fetch groups');
  const data = await res.json();
  return data.groups || [];
}
