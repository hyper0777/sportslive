export interface HighlightlyMatch {
  homeTeam: { name: string };
  awayTeam: { name: string };
  state: {
    score: { current: string };
    description: string;
  };
  [key: string]: unknown;
}

export interface HighlightlyResponse {
  matches: any[];
  source: 'api' | 'error';
  provider: string;
  pagination: { totalCount: number };
  timestamp: string;
}

/**
 * Fetch today's matches from Highlightly Sports API
 * API key is never exposed to frontend - proxied through Netlify Function
 */
export async function getTodaysMatches(): Promise<HighlightlyResponse> {
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

    const data: HighlightlyResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Highlightly matches:', error);
    throw error;
  }
}

/**
 * Format matches for display
 */
export function formatMatches(response: HighlightlyResponse): string[] {
  return response.matches.map((match) => {
    const home = match.homeTeam;
    const away = match.awayTeam;
    const score = `${match.homeScore}-${match.awayScore}`;
    const status = match.status;

    return `${home} vs ${away} | ${score} | ${status}`;
  });
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
 * API key is never exposed to frontend - proxied through Netlify Function
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

    const data: MatchEventsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Highlightly match events:', error);
    throw error;
  }
}
