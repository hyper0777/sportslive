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
    // Try multiple env var names
    const apiKey = process.env.FOOTBALL_HIGHLIGHTS_API_KEY ||
                   process.env.FOOTBALL_HIGHLIGHTS_API_K ||
                   process.env.FOOTBALL_HIGHLIGHTS_API ||
                   process.env.FOOTBALL_HIGHLIGHTS;
    const apiHost = 'football-highlights-api.p.rapidapi.com';

    console.log('API Key check:', { hasKey: !!apiKey, keyLength: apiKey?.length });

    if (!apiKey) {
      console.error('API key not found in any environment variable');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matches: [],
          source: 'error',
          error: 'API key not configured',
          message: 'No API key found in environment variables',
        }),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    // Try multiple possible endpoint formats
    let url = `https://${apiHost}/matches?date=${today}`;

    console.log('Fetching matches from:', url);
    console.log('Using API key:', apiKey.slice(0, 10) + '...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      },
    });

    console.log('API Response Status:', response.status);

    const contentType = response.headers.get('content-type');
    console.log('Response content-type:', contentType);

    // Handle non-OK responses
    if (response.status === 401 || response.status === 403) {
      console.error('Authentication error - invalid API key');
      throw new Error(`Authentication failed: ${response.status}`);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        body: errorBody.slice(0, 500),
      });
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    if (!contentType?.includes('application/json')) {
      const bodyText = await response.text();
      console.error('Invalid response type:', {
        contentType,
        body: bodyText.slice(0, 500),
      });
      throw new Error(`Expected JSON but got ${contentType}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      throw new Error('Response was not valid JSON');
    }

    console.log('API Response received, processing matches');

    const rawMatches = Array.isArray(data) ? data : data.response || data.matches || [];
    const matches = rawMatches.map((match: any) => ({
      id: match.matchId || match.id || `${match.homeTeam}-vs-${match.awayTeam}`,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore: match.homeTeamScore || match.score?.home || 0,
      awayScore: match.awayTeamScore || match.score?.away || 0,
      status: match.status || 'scheduled',
      league: match.league || 'Unknown',
      startTime: match.startDate || match.date || new Date().toISOString(),
      venue: match.venue || undefined,
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        matches,
        source: 'api',
        pagination: { totalCount: matches.length },
        timestamp: new Date().toISOString(),
      }),
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
        matches: [],
        source: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
