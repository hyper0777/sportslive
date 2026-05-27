import { Handler } from '@netlify/functions';

interface MatchDetailsResponse {
  match: any;
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
    const matchId = event.queryStringParameters?.matchId;

    if (!matchId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing matchId parameter',
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
        }),
      };
    }

    const baseUrl = 'https://sports.highlightly.net';
    const url = `${baseUrl}/football/matches/${matchId}`;

    console.log('Fetching match details:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'Content-Type': 'application/json',
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

    const data = await response.json();
    const match = Array.isArray(data) ? data[0] : data;

    console.log('Match details received');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        match,
        source: 'api',
        timestamp: new Date().toISOString(),
      } as MatchDetailsResponse),
    };
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
