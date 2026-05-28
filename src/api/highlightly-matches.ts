export interface HighlightlyMatch {
  id?: string;
  homeTeam: string | { name: string };
  awayTeam: string | { name: string };
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished' | 'scheduled' | 'halftime';
  league: string;
  startTime: string;
  venue?: string;
  [key: string]: unknown;
}

export interface HighlightlyResponse {
  matches: HighlightlyMatch[];
  source: 'api' | 'error' | 'mock';
  provider?: string;
  pagination: { totalCount: number };
  timestamp: string;
}

/**
 * Fetch today's matches from Highlightly Sports API
 * Uses RapidAPI directly (browser-safe with proper API key)
 */
export async function getTodaysMatches(): Promise<HighlightlyResponse> {
  try {
    const apiKey = import.meta.env.VITE_HIGHLIGHTLY_API_KEY;

    if (!apiKey) {
      console.warn('VITE_HIGHLIGHTLY_API_KEY not set - returning mock data');
      return getMockMatches();
    }

    const response = await fetch(
      'https://sport-highlights-api.p.rapidapi.com/football/matches?limit=10',
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'sport-highlights-api.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      console.warn(`API request failed with status ${response.status} - using mock data`);
      return getMockMatches();
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.warn(`Expected JSON but got ${contentType} - using mock data`);
      return getMockMatches();
    }

    const data = await response.json();

    // Transform API response to internal format
    const matches = (Array.isArray(data) ? data : data.data || [])
      .map((match: any) => ({
        id: match.id || `match-${Math.random()}`,
        homeTeam: match.homeTeam?.name || match.homeTeam || 'Unknown',
        awayTeam: match.awayTeam?.name || match.awayTeam || 'Unknown',
        homeScore: match.score?.home || 0,
        awayScore: match.score?.away || 0,
        status: match.status || 'scheduled',
        league: match.league?.name || match.league || 'Football',
        startTime: match.startDate || new Date().toISOString(),
        venue: match.venue?.name || match.venue || 'TBD',
      }));

    return {
      matches,
      source: 'api',
      provider: 'RapidAPI Sport Highlights',
      pagination: { totalCount: matches.length },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching matches from API:', error);
    return getMockMatches();
  }
}

/**
 * Mock matches for fallback/development
 */
function getMockMatches(): HighlightlyResponse {
  return {
    matches: [
      {
        id: 'mock-1',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        homeScore: 2,
        awayScore: 1,
        status: 'live',
        league: 'Premier League',
        startTime: new Date().toISOString(),
        venue: 'Old Trafford',
      },
      {
        id: 'mock-2',
        homeTeam: 'Chelsea',
        awayTeam: 'Arsenal',
        homeScore: 1,
        awayScore: 1,
        status: 'live',
        league: 'Premier League',
        startTime: new Date().toISOString(),
        venue: 'Stamford Bridge',
      },
      {
        id: 'mock-3',
        homeTeam: 'Manchester City',
        awayTeam: 'Tottenham',
        homeScore: 3,
        awayScore: 0,
        status: 'live',
        league: 'Premier League',
        startTime: new Date().toISOString(),
        venue: 'Etihad Stadium',
      },
    ],
    source: 'mock',
    provider: 'Mock Data',
    pagination: { totalCount: 3 },
    timestamp: new Date().toISOString(),
  };
}
