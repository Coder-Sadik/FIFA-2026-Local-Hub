'use server';

import { Game } from '@/types';

const BASE_URL = 'https://worldcup26.ir/get';

// This server action bypasses the 3600s cache so we can poll live data
export async function fetchLiveGamesAction(): Promise<Game[]> {
  try {
    const res = await fetch(`${BASE_URL}/games`, {
      // Revalidate every 30 seconds for live data
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error('Failed to fetch live games');
    const data = await res.json();
    return data.games || [];
  } catch (e) {
    console.error('Live polling failed', e);
    return [];
  }
}
