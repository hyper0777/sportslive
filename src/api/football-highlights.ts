/**
 * Consolidated Highlightly API client
 * All API keys stored securely in Netlify environment variables
 * Frontend never sees API credentials
 */

export interface HighlightlyMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished' | 'scheduled' | 'halftime';
  league: string;
  startTime: string;
  [key: string]: unknown;
}

export interface MatchesResponse {
  matches: HighlightlyMatch[];
  source: 'api' | 'error';
  provider: string;
  timestamp: string;
  error?: string;
}

/**
 * Fetch today's matches from Highlightly Sports API
 */
export async function getTodaysMatches(): Promise<MatchesResponse> {
  try {
    const response = await fetch('/.netlify/functions/highlightly-matches', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'card' | 'substitution' | 'corner' | 'foul' | 'other';
  minute: number;
  team: string;
  player?: string;
  playerOut?: string;
  description: string;
  [key: string]: unknown;
}

export interface MatchEventsResponse {
  events: MatchEvent[];
  matchId: string;
  source: 'api' | 'error';
  timestamp: string;
  error?: string;
}

/**
 * Fetch events (goals, cards, substitutions, etc.) for a match
 */
export async function getMatchEvents(matchId: string): Promise<MatchEventsResponse> {
  try {
    const response = await fetch(
      `/.netlify/functions/highlightly-events?id=${encodeURIComponent(matchId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching match events:', error);
    throw error;
  }
}

export interface StandingEntry {
  rank: number;
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  [key: string]: unknown;
}

export interface StandingsResponse {
  standings: StandingEntry[];
  league: {
    id: number;
    name: string;
  };
  season: number;
  source: 'api' | 'error';
  timestamp: string;
  error?: string;
}

/**
 * Fetch standings for a league and season
 */
export async function getStandings(
  leagueId: number,
  season: number
): Promise<StandingsResponse> {
  try {
    const response = await fetch(
      `/.netlify/functions/highlightly-standings?leagueId=${leagueId}&season=${season}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching standings:', error);
    throw error;
  }
}
