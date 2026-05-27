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
    const apiKey = process.env.FOOTBALL_HIGHLIGHTS_API_KEY;
    const apiHost = 'football-highlights-api.p.rapidapi.com';

    if (!apiKey) {
      console.error('FOOTBALL_HIGHLIGHTS_API_KEY not configured');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matches: [],
          source: 'error',
          error: 'API key not configured',
          message: 'FOOTBALL_HIGHLIGHTS_API_KEY is missing',
        }),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const url = `https://${apiHost}/matches?date=${today}`;

    console.log('Fetching matches from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      },
    });

    console.log('API Response Status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody.slice(0, 200),
      });
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
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
