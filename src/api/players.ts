export interface Player {
  id: string;
  name: string;
  team?: string;
  position?: string;
  [key: string]: any;
}

export interface SearchPlayersResponse {
  players: Player[];
  source: 'api' | 'mock' | 'error';
  timestamp: string;
  error?: string;
}

export interface PlayerStatistics {
  appearances?: number;
  goals?: number;
  assists?: number;
  passes?: number;
  tackles?: number;
  interceptions?: number;
  saves?: number;
  cleanSheets?: number;
  [key: string]: any;
}

export interface PlayerStatsResponse {
  statistics: PlayerStatistics;
  source: 'api' | 'mock' | 'error';
  timestamp: string;
  error?: string;
}

/**
 * Search for players by name
 */
export async function searchPlayers(query: string, limit: number = 5): Promise<SearchPlayersResponse> {
  try {
    if (!query || query.trim().length === 0) {
      return {
        players: [],
        source: 'error',
        timestamp: new Date().toISOString(),
        error: 'Query cannot be empty',
      };
    }

    const response = await fetch(
      `/.netlify/functions/search-players?query=${encodeURIComponent(query)}&limit=${limit}`,
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

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`invalid JSON - received ${contentType}`);
    }

    const data: SearchPlayersResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching players:', error);
    return {
      players: [],
      source: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get player statistics by ID
 */
export async function getPlayerStatistics(playerId: string): Promise<PlayerStatsResponse> {
  try {
    if (!playerId) {
      return {
        statistics: {},
        source: 'error',
        timestamp: new Date().toISOString(),
        error: 'Player ID is required',
      };
    }

    const response = await fetch(
      `/.netlify/functions/player-statistics?playerId=${encodeURIComponent(playerId)}`,
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

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`invalid JSON - received ${contentType}`);
    }

    const data: PlayerStatsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching player statistics:', error);
    return {
      statistics: {},
      source: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
