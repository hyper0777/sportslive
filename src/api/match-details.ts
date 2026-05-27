export interface MatchDetailsResponse {
  match: {
    homeTeam: { name: string };
    awayTeam: { name: string };
    state: {
      score: { current: string };
      description: string;
    };
    venue?: {
      name: string;
      city: string;
    };
    referee?: {
      name: string;
    };
    forecast?: {
      temperature: number;
      status: string;
    };
    events?: Array<{
      time: number;
      type: string;
      player: string;
      team: { name: string };
    }>;
    predictions?: {
      prematch?: Array<{
        probabilities: {
          home: number;
          draw: number;
          away: number;
        };
      }>;
    };
  };
  source: 'api' | 'error';
  timestamp: string;
}

/**
 * Fetch match details from Highlightly Sports API
 * API key is proxied through Netlify Function
 */
export async function getMatchDetails(matchId: string): Promise<MatchDetailsResponse> {
  try {
    const response = await fetch(`/.netlify/functions/match-details?matchId=${encodeURIComponent(matchId)}`, {
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

    const data: MatchDetailsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching match details:', error);
    throw error;
  }
}
