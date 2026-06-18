import { Game, Team, Stadium, Group } from '@/types';
import { getAbsoluteGameDate } from '@/lib/timezone';

const BASE_URL = 'https://worldcup26.ir/get';

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 300): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

// Revalidate static data every hour (3600 seconds)
// This significantly reduces API calling costs.
export async function getGames(): Promise<Game[]> {
  try {
    const res = await fetchWithRetry(`${BASE_URL}/games`, {
      next: { revalidate: 60 }, // Revalidate every minute for live results
    });
    const data = await res.json();
    const games: Game[] = data.games || [];
    
    return games.sort((a, b) => {
      return getAbsoluteGameDate(a.local_date, a.stadium_id).getTime() - getAbsoluteGameDate(b.local_date, b.stadium_id).getTime();
    });
  } catch (error) {
    console.error('Failed to fetch games:', error);
    return []; // Return empty array as fallback
  }
}

export async function getTeams(): Promise<Team[]> {
  try {
    const res = await fetchWithRetry(`${BASE_URL}/teams`, {
      next: { revalidate: 3600 * 24 }, // Daily
    });
    const data = await res.json();
    return data.teams || [];
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return [];
  }
}

export async function getStadiums(): Promise<Stadium[]> {
  try {
    const res = await fetchWithRetry(`${BASE_URL}/stadiums`, {
      next: { revalidate: 3600 * 24 * 7 }, // Weekly
    });
    const data = await res.json();
    return data.stadiums || [];
  } catch (error) {
    console.error('Failed to fetch stadiums:', error);
    return [];
  }
}

export async function getGroups(): Promise<Group[]> {
  try {
    const res = await fetchWithRetry(`${BASE_URL}/groups`, {
      next: { revalidate: 60 }, // Revalidate every minute for live standings
    });
    const data = await res.json();
    return data.groups || [];
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    return [];
  }
}
