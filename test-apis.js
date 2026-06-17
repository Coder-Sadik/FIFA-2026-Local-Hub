const BASE_URL = 'https://worldcup26.ir/get';

async function fetchWithRetry(url, retries = 3, backoff = 300) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    throw error;
  }
}

async function run() {
    const gamesRes = await fetchWithRetry(`${BASE_URL}/games`);
    const gamesData = await gamesRes.json();
    const games = gamesData.games || [];
    
    const groupsRes = await fetchWithRetry(`${BASE_URL}/groups`);
    const groupsData = await groupsRes.json();
    const groups = groupsData.groups || [];
    
    const austriaJordan = games.find(g => (g.home_team_name_en === 'Austria' && g.away_team_name_en === 'Jordan') || (g.home_team_name_en === 'Jordan' && g.away_team_name_en === 'Austria'));
    console.log("Game: ", austriaJordan);
    
    if (austriaJordan) {
        const group = groups.find(g => g.name === austriaJordan.group);
        console.log("Group: ", group);
    }
}
run();
