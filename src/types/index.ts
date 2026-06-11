export interface Team {
  _id: string;
  id: string;
  name_en: string;
  name_fa: string;
  flag: string;
  fifa_ranking: string;
  groups: string;
}

export interface Game {
  _id: string;
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers: string;
  away_scorers: string;
  group: string;
  matchday: string;
  local_date: string; // "MM/DD/YYYY HH:mm"
  stadium_id: string;
  finished: string; // "TRUE" | "FALSE"
  time_elapsed: string; // "notstarted" | "finished" | "half-time" | "45" etc.
  type: string;
  home_team_name_en: string;
  away_team_name_en: string;
  home_team_label?: string;
  away_team_label?: string;
}

export interface Stadium {
  _id: string;
  id: string;
  name_en: string;
  city_en: string;
  capacity: string;
}

export interface Standing {
  team_id: string;
  team_name_en: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface GroupTeam {
  _id: string;
  team_id: string;
  mp: string;
  w: string;
  d: string;
  l: string;
  gf: string;
  ga: string;
  gd: string;
  pts: string;
}

export interface Group {
  _id: string;
  name: string;
  teams: GroupTeam[];
}
