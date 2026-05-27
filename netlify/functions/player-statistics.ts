import { Handler } from '@netlify/functions';

interface PlayerStats {
  [key: string]: any;
}

interface StatsResponse {
  statistics: PlayerStats;
  source: 'api' | 'error';
  timestamp: string;
}

const handler: Handler = async (event) => {
  // Allow CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  try {
    const playerId = event.queryStringParameters?.playerId;

    if (!playerId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing playerId parameter',
          statistics: {},
        }),
      };
    }

    // Try multiple env var names
    const apiKey = process.env.FOOTBALL_HIGHLIGHTS_API_KEY || 
                   process.env.FOOTBALL_HIGHLIGHTS_API_K ||
                   process.env.FOOTBALL_HIGHLIGHTS_API ||
                   process.env.FOOTBALL_HIGHLIGHTS;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'API key not configured',
          statistics: {},
        }),
      };
    }

    const baseUrl = 'https://sports.highlightly.net';
    const url = `${baseUrl}/football/players/statistics/${playerId}`;

    console.log('Fetching player statistics:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
      },
    });

    console.log('API Response Status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody.slice(0, 500),
      });
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Expected JSON but got ${contentType}`);
    }

    const bodyText = await response.text();
    const statistics = JSON.parse(bodyText);

    console.log('Player statistics received');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        statistics,
        source: 'api',
        timestamp: new Date().toISOString(),
      } as StatsResponse),
    };
  } catch (error) {
    console.error('Fetch error:', error);
    
    // Return mock data on error
    const mockStats = {
      appearances: 25,
      goals: 18,
      assists: 5,
      passes: 456,
      tackles: 12,
      interceptions: 8,
      saves: 0,
      cleanSheets: 0,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        statistics: mockStats,
        source: 'mock',
        error: error instanceof Error ? error.message : 'Unknown error - using mock data',
        timestamp: new Date().toISOString(),
      } as StatsResponse),
    };
  }
};

export { handler };
