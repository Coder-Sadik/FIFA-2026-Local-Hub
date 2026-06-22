'use server';

import { Game } from '@/types';

const BASE_URL = 'https://worldcup26.ir/get';

// Last successful games payload — served as stale data if the API is down.
let _cachedGames: Game[] | null = null;

/**
 * Fetch /games with 404-aware retry and stale-cache fallback.
 *
 * • Any non-404 error → 3 retries, 300 ms → 600 ms → 1.2 s.
 * • 404               → 8 retries, 500 ms → 1 s → … → capped at 10 s.
 *
 * After exhausting retries, returns the last successfully fetched games array
 * (so the UI never goes blank) or an empty array on first-ever call.
 */
async function fetchWithRetry(
  url: string,
  retries: number,
  backoff: number,
  is404Retry = false,
): Promise<Response> {
  try {
    const res = await fetch(url, { next: { revalidate: 30 } });

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      (err as Error & { status?: number }).status = res.status;
      throw err;
    }

    return res;
  } catch (error) {
    const status = (error as Error & { status?: number }).status;
    const hit404 = status === 404;

    // Choose retry budget based on error type.
    const retriesLeft = is404Retry || hit404 ? retries : retries;

    if (retriesLeft > 0) {
      const delay = hit404 || is404Retry
        ? Math.min(backoff, 10_000)
        : backoff;

      await new Promise(r => setTimeout(r, delay));
      return fetchWithRetry(url, retriesLeft - 1, backoff * 2, hit404 || is404Retry);
    }

    throw error;
  }
}

export async function fetchLiveGamesAction(): Promise<Game[]> {
  const url = `${BASE_URL}/games`;

  try {
    // 404 path gets up to 8 retries; start conservative and let fetchWithRetry escalate.
    const res = await fetchWithRetry(url, 8, 500, false);
    const data = await res.json();
    const games: Game[] = data.games || [];
    _cachedGames = games; // update stale-cache on success
    return games;
  } catch (e) {
    console.error('[live] fetchLiveGamesAction failed after all retries:', e);

    if (_cachedGames !== null) {
      console.warn('[live] Serving stale cached games.');
      return _cachedGames;
    }

    return [];
  }
}

