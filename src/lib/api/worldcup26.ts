import { Game, Team, Stadium, Group } from '@/types';
import { getAbsoluteGameDate } from '@/lib/timezone';

const BASE_URL = 'https://worldcup26.ir/get';

// ─── Last-known-good cache ────────────────────────────────────────────────────
// Holds the most recent successful JSON payload per URL so that when the API
// returns 404 / any transient error we can still serve stale data instead of
// an empty array while retrying in the background.
const _cache = new Map<string, unknown>();

/**
 * Fetch with retry logic.
 *
 * • Normal errors  → up to `retries` attempts with exponential back-off.
 * • 404 specifically → up to 8 attempts (the endpoint sometimes disappears
 *   briefly) with back-off capped at 10 s, then throws so the caller can
 *   fall back to cached data.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  backoff = 300,
): Promise<Response> {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      const err = new Error(`HTTP error! status: ${res.status}`);
      (err as Error & { status?: number }).status = res.status;
      throw err;
    }

    return res;
  } catch (error) {
    const status = (error as Error & { status?: number }).status;
    const is404 = status === 404;

    // 404 gets more aggressive retries (up to 8 total); other errors get the
    // standard number of retries passed by the caller.
    const maxRetries = is404 ? 8 : retries;
    const currentRetries = is404
      ? (error as Error & { _retriesLeft?: number })._retriesLeft ?? maxRetries
      : retries;

    if (currentRetries > 0) {
      // Backoff capped at 10 s for 404s so we don't wait forever.
      const delay = is404 ? Math.min(backoff, 10_000) : backoff;
      await new Promise(resolve => setTimeout(resolve, delay));

      // Pass reduced retry count forward, carrying it on the error object for
      // 404 so the recursive call knows where we are.
      const nextErr = new Error('');
      (nextErr as Error & { _retriesLeft?: number })._retriesLeft = currentRetries - 1;

      return fetchWithRetry(
        url,
        options,
        is404 ? currentRetries - 1 : retries - 1,
        backoff * 2,
      );
    }

    throw error;
  }
}

/**
 * Wrapper around fetchWithRetry that:
 *  1. Tries to fetch fresh data.
 *  2. On success, stores the parsed JSON in the in-memory cache.
 *  3. On failure (after all retries), returns the last-known-good cached
 *     value, or `fallback` if there is no cached value yet.
 */
async function fetchJSON<T>(url: string, options: RequestInit, fallback: T): Promise<T> {
  try {
    const res = await fetchWithRetry(url, options);
    const data = (await res.json()) as T;
    _cache.set(url, data);
    return data;
  } catch (error) {
    console.error(`[worldcup26] fetch failed for ${url}:`, error);

    const cached = _cache.get(url) as T | undefined;
    if (cached !== undefined) {
      console.warn(`[worldcup26] Serving stale cached data for ${url}`);
      return cached;
    }

    return fallback;
  }
}

// Revalidate static data every hour (3600 seconds)
// This significantly reduces API calling costs.
export async function getGames(): Promise<Game[]> {
  const url = `${BASE_URL}/games`;
  const data = await fetchJSON<{ games?: Game[] }>(
    url,
    { next: { revalidate: 60 } }, // Revalidate every minute for live results
    {},
  );
  const games: Game[] = data.games || [];
  return games.sort((a, b) =>
    getAbsoluteGameDate(a.local_date, a.stadium_id).getTime() -
    getAbsoluteGameDate(b.local_date, b.stadium_id).getTime(),
  );
}

export async function getTeams(): Promise<Team[]> {
  const data = await fetchJSON<{ teams?: Team[] }>(
    `${BASE_URL}/teams`,
    { next: { revalidate: 3600 * 24 } }, // Daily
    {},
  );
  return data.teams || [];
}

export async function getStadiums(): Promise<Stadium[]> {
  const data = await fetchJSON<{ stadiums?: Stadium[] }>(
    `${BASE_URL}/stadiums`,
    { next: { revalidate: 3600 * 24 * 7 } }, // Weekly
    {},
  );
  return data.stadiums || [];
}

export async function getGroups(): Promise<Group[]> {
  const data = await fetchJSON<{ groups?: Group[] }>(
    `${BASE_URL}/groups`,
    { next: { revalidate: 60 } }, // Revalidate every minute for live standings
    {},
  );
  return data.groups || [];
}

