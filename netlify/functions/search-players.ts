import { Handler } from '@netlify/functions';

interface Player {
  id: string;
  name: string;
  [key: string]: any;
}

interface SearchResponse {
  players: Player[];
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
    const query = event.queryStringParameters?.query;
    const limit = event.queryStringParameters?.limit || '5';

    if (!query) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing query parameter',
          players: [],
        }),
      };
    }

    // Try multiple env var names
    const apiKey = process.env.FOOTBALL_HIGHLIGHTS_API_KEY || 
                   process.env.FOOTBALL_HIGHLIGHTS_API_K ||
                   process.env.FOOTBALL_HIGHLIGHTS_API ||
                   process.env.FOOTBALL_HIGHLIGHTS;

    if (!apiKey) {
      console.error('API key not found');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'API key not configured',
          players: [],
        }),
      };
    }

    const baseUrl = 'https://sports.highlightly.net';
    const url = `${baseUrl}/football/players?name=${encodeURIComponent(query)}&limit=${limit}`;

    console.log('Searching players:', url);

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
    const data = JSON.parse(bodyText);

    const players = data.data || [];
    console.log(`Found ${players.length} players`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        players,
        source: 'api',
        timestamp: new Date().toISOString(),
      } as SearchResponse),
    };
  } catch (error) {
    console.error('Fetch error:', error);
    
    // Return mock data on error
    const mockPlayers = [
      { id: '1', name: 'Erling Haaland', team: 'Manchester City', position: 'Forward' },
      { id: '2', name: 'Harry Kane', team: 'Bayern Munich', position: 'Forward' },
      { id: '3', name: 'Kylian Mbappé', team: 'PSG', position: 'Forward' },
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        players: mockPlayers,
        source: 'mock',
        error: error instanceof Error ? error.message : 'Unknown error - using mock data',
        timestamp: new Date().toISOString(),
      } as SearchResponse),
    };
  }
};

export { handler };
