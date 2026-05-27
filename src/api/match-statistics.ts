export interface TeamStats {
  team: string;
  possession: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passAccuracy: number;
  tackles: number;
  fouls: number;
  offsides: number;
  corners: number;
  yellowCards: number;
  redCards: number;
  [key: string]: unknown;
}

export interface MatchStatisticsResponse {
  matchId: string;
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  source: 'api' | 'error';
  timestamp: string;
  error?: string;
}

/**
 * Fetch match statistics from Sport Highlights API
 * API key is kept server-side and never exposed to frontend
 */
export async function getMatchStatistics(matchId: string): Promise<MatchStatisticsResponse> {
  try {
    const response = await fetch(
      `/.netlify/functions/match-statistics?id=${encodeURIComponent(matchId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Match statistics request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching match statistics:', error);
    throw error;
  }
}

/**
 * Format statistics for display
 */
export function formatStatistic(value: number, type: string): string {
  if (type.includes('percentage') || type.includes('accuracy')) {
    return `${Math.round(value)}%`;
  }
  return value.toString();
}
