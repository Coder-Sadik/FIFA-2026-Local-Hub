export const STADIUM_MAP: Record<string, string> = {
  '1': 'Mexico City Stadium',
  '2': 'Guadalajara Stadium',
  '3': 'Monterrey Stadium',
  '4': 'Dallas Stadium',
  '5': 'Houston Stadium',
  '6': 'Kansas City Stadium',
  '7': 'Atlanta Stadium',
  '8': 'Miami Stadium',
  '9': 'Boston Stadium',
  '10': 'Philadelphia Stadium',
  '11': 'New York New Jersey Stadium',
  '12': 'Toronto Stadium',
  '13': 'BC Place Vancouver',
  '14': 'Seattle Stadium',
  '15': 'San Francisco Bay Area Stadium',
  '16': 'Los Angeles Stadium'
};

export function getStadiumName(id: string): string {
  return STADIUM_MAP[id] || `Stadium ${id}`;
}
