const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';
const WORLD_CUP_LEAGUE_ID = '4429';

// Cache revalidation times
const ONE_DAY = 86400;
const ONE_WEEK = 604800;

export interface SportsDbTeam {
  idTeam: string;
  strTeam: string;
  strBadge: string;
  strStadium: string;
  strDescriptionEN: string;
  strFanart1: string;
  strFanart2: string;
  strBanner: string;
  strKeywords: string;
}

export interface SportsDbPlayer {
  idPlayer: string;
  idTeam: string;
  strPlayer: string;
  strPosition: string;
  strNationality: string;
  strNumber: string;
  strCutout: string;
  strThumb: string;
  dateBorn: string;
  strDescriptionEN: string;
  strWage: string;
  strFacebook: string;
  strTwitter: string;
  strInstagram: string;
}

/**
 * Fetches all teams in the World Cup to map names to idTeam.
 */
export async function getAllWorldCupTeams(): Promise<SportsDbTeam[]> {
  try {
    const res = await fetch(`${BASE_URL}/lookup_all_teams.php?id=${WORLD_CUP_LEAGUE_ID}`, {
      next: { revalidate: ONE_WEEK },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.teams || [];
  } catch (e) {
    console.error('Error fetching World Cup teams from TheSportsDB', e);
    return [];
  }
}

/**
 * Maps a generic team name (e.g. 'United States') to TheSportsDB idTeam.
 */
export async function getTeamIdByName(teamName: string): Promise<string | null> {
  const teams = await getAllWorldCupTeams();
  
  // Try exact match first
  let match = teams.find(t => t.strTeam.toLowerCase() === teamName.toLowerCase());
  
  // Try partial match if exact fails (e.g. "USA" vs "United States")
  if (!match) {
    match = teams.find(t => 
      t.strTeam.toLowerCase().includes(teamName.toLowerCase()) || 
      teamName.toLowerCase().includes(t.strTeam.toLowerCase())
    );
  }
  
  return match ? match.idTeam : null;
}

/**
 * Fetches detailed info for a single team.
 */
export async function getTeamDetails(idTeam: string): Promise<SportsDbTeam | null> {
  try {
    const res = await fetch(`${BASE_URL}/lookupteam.php?id=${idTeam}`, {
      next: { revalidate: ONE_DAY },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.teams ? data.teams[0] : null;
  } catch (e) {
    console.error(`Error fetching team details for ${idTeam}`, e);
    return null;
  }
}

/**
 * Fetches all players for a specific team.
 */
export async function getTeamPlayers(idTeam: string): Promise<SportsDbPlayer[]> {
  try {
    const res = await fetch(`${BASE_URL}/lookup_all_players.php?id=${idTeam}`, {
      next: { revalidate: ONE_DAY },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.player || [];
  } catch (e) {
    console.error(`Error fetching players for team ${idTeam}`, e);
    return [];
  }
}

/**
 * Fetches detailed info for a single player.
 */
export async function getPlayerDetails(idPlayer: string): Promise<SportsDbPlayer | null> {
  try {
    const res = await fetch(`${BASE_URL}/lookupplayer.php?id=${idPlayer}`, {
      next: { revalidate: ONE_DAY },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.players ? data.players[0] : null;
  } catch (e) {
    console.error(`Error fetching player details for ${idPlayer}`, e);
    return null;
  }
}
