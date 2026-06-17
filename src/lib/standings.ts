import { Game, Group } from '@/types';

export function calculateAccurateStandings(groups: Group[], games: Game[]): Group[] {
  // Deep clone groups so we don't mutate original
  const newGroups: Group[] = JSON.parse(JSON.stringify(groups));

  // Reset all stats to 0
  newGroups.forEach(group => {
    group.teams.forEach(team => {
      team.mp = '0';
      team.w = '0';
      team.d = '0';
      team.l = '0';
      team.gf = '0';
      team.ga = '0';
      team.gd = '0';
      team.pts = '0';
    });
  });

  // Calculate from finished group games
  games.forEach(game => {
    if (game.type !== 'group' || game.finished !== 'TRUE') return;
    
    const groupName = game.group;
    const group = newGroups.find(g => g.name === groupName);
    if (!group) return;

    const homeTeam = group.teams.find(t => t.team_id === game.home_team_id);
    const awayTeam = group.teams.find(t => t.team_id === game.away_team_id);
    
    if (!homeTeam || !awayTeam) return;

    const homeScore = parseInt(game.home_score, 10);
    const awayScore = parseInt(game.away_score, 10);

    // Update MP
    homeTeam.mp = (parseInt(homeTeam.mp, 10) + 1).toString();
    awayTeam.mp = (parseInt(awayTeam.mp, 10) + 1).toString();

    // Update GF / GA
    homeTeam.gf = (parseInt(homeTeam.gf, 10) + homeScore).toString();
    homeTeam.ga = (parseInt(homeTeam.ga, 10) + awayScore).toString();
    awayTeam.gf = (parseInt(awayTeam.gf, 10) + awayScore).toString();
    awayTeam.ga = (parseInt(awayTeam.ga, 10) + homeScore).toString();

    // Update W/D/L and PTS
    if (homeScore > awayScore) {
      homeTeam.w = (parseInt(homeTeam.w, 10) + 1).toString();
      homeTeam.pts = (parseInt(homeTeam.pts, 10) + 3).toString();
      awayTeam.l = (parseInt(awayTeam.l, 10) + 1).toString();
    } else if (awayScore > homeScore) {
      awayTeam.w = (parseInt(awayTeam.w, 10) + 1).toString();
      awayTeam.pts = (parseInt(awayTeam.pts, 10) + 3).toString();
      homeTeam.l = (parseInt(homeTeam.l, 10) + 1).toString();
    } else {
      homeTeam.d = (parseInt(homeTeam.d, 10) + 1).toString();
      awayTeam.d = (parseInt(awayTeam.d, 10) + 1).toString();
      homeTeam.pts = (parseInt(homeTeam.pts, 10) + 1).toString();
      awayTeam.pts = (parseInt(awayTeam.pts, 10) + 1).toString();
    }

    // Update GD
    homeTeam.gd = (parseInt(homeTeam.gf, 10) - parseInt(homeTeam.ga, 10)).toString();
    awayTeam.gd = (parseInt(awayTeam.gf, 10) - parseInt(awayTeam.ga, 10)).toString();
  });

  return newGroups;
}
