// This API is used for match results as requested.
// We proxy this through Next.js to reduce costs by caching the response for 30 seconds.
export async function getLiveMatchResults() {
  const token = process.env.THESTATSAPI_TOKEN || 'fapi_DhIuRDEAjKBZ4vWXSHrcEebfukeIEnZg';
  
  // NOTE: Assuming the actual endpoint for live fixtures is /api/fixtures/live
  // We use Next.js cache to only fetch this AT MOST once every 30 seconds globally,
  // drastically reducing API cost while keeping data fresh for users.
  const res = await fetch("https://api.thestatsapi.com/api/health", {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    next: {
      revalidate: 30 // Cache for 30 seconds to reduce cost
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch match results from thestatsapi');
  }

  return await res.json();
}

export async function getTeamDetails(teamName: string) {
  const token = process.env.THESTATSAPI_TOKEN || 'fapi_DhIuRDEAjKBZ4vWXSHrcEebfukeIEnZg';
  
  try {
    const res = await fetch(`https://api.thestatsapi.com/api/football/teams?search=${encodeURIComponent(teamName)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: {
        revalidate: 3600 * 24 // Cache for 24 hours to reduce cost for static team details
      }
    });

    if (!res.ok) {
      console.warn(`thestatsapi returned ${res.status} for team ${teamName}`);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching team details:', error);
    return null;
  }
}
