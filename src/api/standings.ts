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
 * Fetch standings from Highlightly Sports API
 * API key is kept server-side and never exposed to frontend
 */
export async function getStandings(
  leagueId: number,
  season: number
): Promise<StandingsResponse> {
  try {
    const response = await fetch('/.netlify/functions/standings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Pass parameters as query string
      // The Netlify Function will handle league and season params
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data: StandingsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching standings:', error);
    throw error;
  }
}

/**
 * Format standings for display
 */
export function formatStandings(standings: StandingEntry[]): string[] {
  return standings.map((entry) => {
    return `${entry.rank}. ${entry.teamName} - ${entry.points}pts (${entry.wins}W ${entry.draws}D ${entry.losses}L)`;
  });
}
