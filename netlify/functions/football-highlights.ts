import { Handler } from '@netlify/functions';

interface MatchParams {
  awayTeamName?: string;
  homeTeamId?: string;
  date?: string;
  leagueId?: string;
  limit?: number;
  offset?: number;
  countryName?: string;
  homeTeamName?: string;
  countryCode?: string;
  timezone?: string;
  leagueName?: string;
  season?: string;
  awayTeamId?: string;
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
    const params = JSON.parse(event.body || '{}') as MatchParams;

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
          matches: [],
        }),
      };
    }

    // Build query string safely
    const queryParams = new URLSearchParams();
    
    if (params.awayTeamName) queryParams.set('awayTeamName', params.awayTeamName);
    if (params.homeTeamId) queryParams.set('homeTeamId', params.homeTeamId.toString());
    if (params.date) queryParams.set('date', params.date);
    if (params.leagueId) queryParams.set('leagueId', params.leagueId.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.offset) queryParams.set('offset', params.offset.toString());
    if (params.countryName) queryParams.set('countryName', params.countryName);
    if (params.homeTeamName) queryParams.set('homeTeamName', params.homeTeamName);
    if (params.countryCode) queryParams.set('countryCode', params.countryCode);
    if (params.timezone) queryParams.set('timezone', params.timezone);
    if (params.leagueName) queryParams.set('leagueName', params.leagueName);
    if (params.season) queryParams.set('season', params.season);
    if (params.awayTeamId) queryParams.set('awayTeamId', params.awayTeamId.toString());

    // Default pagination
    if (!queryParams.has('limit')) queryParams.set('limit', '100');
    if (!queryParams.has('offset')) queryParams.set('offset', '0');

    const url = `https://${apiHost || 'football-highlights-api.p.rapidapi.com'}/matches?${queryParams.toString()}`;

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
        matches: data.response || data.matches || [],
        source: 'api',
        timestamp: new Date().toISOString(),
        ...data,
      }),
    };
  } catch (error) {
    console.error('Football highlights error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to fetch highlights',
        message: error instanceof Error ? error.message : 'Unknown error',
        matches: [],
      }),
    };
  }
};

export { handler };
