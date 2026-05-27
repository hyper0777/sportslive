import { Handler } from '@netlify/functions';

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
    const matchId = event.queryStringParameters?.id;

    if (!matchId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing match ID',
          message: 'Please provide an id query parameter',
        }),
      };
    }

    const apiKey = process.env.FOOTBALL_HIGHLIGHTS_API_KEY;
    const apiHost = process.env.FOOTBALL_HIGHLIGHTS_API_HOST;

    if (!apiKey) {
      console.error('FOOTBALL_HIGHLIGHTS_API_KEY not configured');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'API key not configured',
          message: 'FOOTBALL_HIGHLIGHTS_API_KEY missing in environment variables',
        }),
      };
    }

    const url = `https://${apiHost || 'football-highlights-api.p.rapidapi.com'}/matches/${encodeURIComponent(matchId)}`;

    console.log('Fetching match detail from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost || 'football-highlights-api.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status}. ${errorText.slice(0, 300)}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        match: data,
        source: 'api',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Match detail API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to fetch match details',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
