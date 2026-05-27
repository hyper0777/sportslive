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
  source: 'api' | 'error' | 'mock';
  provider?: string;
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

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`invalid JSON - received ${contentType}`);
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
