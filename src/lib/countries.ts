export const COUNTRY_DATA: Record<string, { code: string; color: string }> = {
  'Argentina': { code: 'ar', color: '#43A1D5' },
  'Brazil': { code: 'br', color: '#FFDC02' },
  'France': { code: 'fr', color: '#002395' },
  'England': { code: 'gb-eng', color: '#CE1124' },
  'Spain': { code: 'es', color: '#AA151B' },
  'Germany': { code: 'de', color: '#000000' },
  'Portugal': { code: 'pt', color: '#FF0000' },
  'Italy': { code: 'it', color: '#0066B2' },
  'Netherlands': { code: 'nl', color: '#F36C21' },
  'Croatia': { code: 'hr', color: '#FF0000' },
  'Uruguay': { code: 'uy', color: '#0038A8' },
  'Belgium': { code: 'be', color: '#E30613' },
  'Colombia': { code: 'co', color: '#FCD116' },
  'Mexico': { code: 'mx', color: '#006847' },
  'United States': { code: 'us', color: '#B31942' },
  'Canada': { code: 'ca', color: '#FF0000' },
  'Senegal': { code: 'sn', color: '#00853F' },
  'Japan': { code: 'jp', color: '#000555' },
  'South Korea': { code: 'kr', color: '#0047A0' },
  'Australia': { code: 'au', color: '#008751' },
  'Morocco': { code: 'ma', color: '#C1272D' },
  'Switzerland': { code: 'ch', color: '#FF0000' },
  'Ecuador': { code: 'ec', color: '#FFDD00' },
  'Poland': { code: 'pl', color: '#DC143C' },
  'Saudi Arabia': { code: 'sa', color: '#006C35' },
  'Qatar': { code: 'qa', color: '#8A1538' },
  'Iran': { code: 'ir', color: '#239F40' },
  'Costa Rica': { code: 'cr', color: '#CE1126' },
  'Cameroon': { code: 'cm', color: '#007A5E' },
  'Ghana': { code: 'gh', color: '#006B3F' },
  'Serbia': { code: 'rs', color: '#C6363C' },
  'Denmark': { code: 'dk', color: '#C60C30' },
  'Wales': { code: 'gb-wls', color: '#D30731' },
  'Tunisia': { code: 'tn', color: '#E70013' },
  'South Africa': { code: 'za', color: '#007749' },
  'Czech Republic': { code: 'cz', color: '#11457E' },
  'Chile': { code: 'cl', color: '#D52B1E' },
  'Peru': { code: 'pe', color: '#D91023' },
  'Sweden': { code: 'se', color: '#FECC00' },
  'Egypt': { code: 'eg', color: '#CE1126' },
  'Nigeria': { code: 'ng', color: '#008751' },
  'Ivory Coast': { code: 'ci', color: '#F77F00' },
  'Algeria': { code: 'dz', color: '#006233' },
  'Paraguay': { code: 'py', color: '#D52B1E' },
  'Venezuela': { code: 've', color: '#FFCC00' },
  'Bolivia': { code: 'bo', color: '#007A33' },
  'Norway': { code: 'no', color: '#BA0C2F' },
  'Turkey': { code: 'tr', color: '#E30A17' },
  'Ukraine': { code: 'ua', color: '#0057B7' },
  'Scotland': { code: 'gb-sct', color: '#0065BD' },
};

export function getCountryCode(name: string): string | null {
  return COUNTRY_DATA[name]?.code || null;
}

export function getCountryColor(name: string): string {
  return COUNTRY_DATA[name]?.color || '#333333';
}

export function getFlagUrl(name: string, size: 'w40' | 'w80' | 'w160' = 'w40'): string {
  const code = getCountryCode(name);
  if (!code) return ''; // fallback to empty
  return `https://flagcdn.com/${size}/${code}.png`;
}
