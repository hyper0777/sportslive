export interface MatchQueryParams {
  awayTeamName?: string;
  homeTeamId?: string;
  date?: string;
  leagueId?: string;
  limit?: number;
  offset?: number;
  countryName?: string;
  homeTeamName?: string;
  countryCode?: string;
  timezone?: string;
  leagueName?: string;
  season?: string;
  awayTeamId?: string;
}

export interface FootballHighlightsResponse {
  matches: any[];
  source: 'api' | 'error';
  timestamp: string;
  [key: string]: unknown;
}

export async function fetchFootballHighlights(
  params: MatchQueryParams
): Promise<FootballHighlightsResponse> {
  try {
    const response = await fetch('/.netlify/functions/football-highlights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Highlights request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching football highlights:', error);
    throw error;
  }
}

// Convenience function - fetch matches by date
export async function getMatchesByDate(date: string, options?: Partial<MatchQueryParams>) {
  return fetchFootballHighlights({
    date,
    limit: 100,
    offset: 0,
    timezone: 'Etc/UTC',
    ...options,
  });
}

// Convenience function - fetch matches by league
export async function getMatchesByLeague(
  leagueId: string,
  season?: string,
  options?: Partial<MatchQueryParams>
) {
  return fetchFootballHighlights({
    leagueId,
    season: season || new Date().getFullYear().toString(),
    limit: 100,
    offset: 0,
    ...options,
  });
}

// Convenience function - fetch team fixtures
export async function getTeamFixtures(
  homeTeamId: string,
  awayTeamId?: string,
  options?: Partial<MatchQueryParams>
) {
  return fetchFootballHighlights({
    homeTeamId,
    awayTeamId,
    limit: 50,
    offset: 0,
    ...options,
  });
}
