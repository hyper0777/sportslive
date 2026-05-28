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
    // Get RapidAPI key for Sport Highlights API
    const apiKey = process.env.VITE_HIGHLIGHTLY_API_KEY ||
                   process.env.HIGHLIGHTLY_API_KEY;

    if (!apiKey) {
      console.error('API key not found in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('API') || k.includes('api')));
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matches: [],
          source: 'error',
          error: 'API key not configured',
          message: 'Set VITE_HIGHLIGHTLY_API_KEY or HIGHLIGHTLY_API_KEY environment variable',
        }),
      };
    }

    // Use RapidAPI Sport Highlights API endpoint
    const baseUrl = 'https://sport-highlights-api.p.rapidapi.com';
    // Note: RapidAPI might not support 'live' status - try without filter first
    const url = `${baseUrl}/football/matches?limit=10`;

    console.log('Fetching from Sport Highlights API:', url);
    console.log('Using API key:', apiKey.slice(0, 10) + '...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'sport-highlights-api.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', {
      contentType: response.headers.get('content-type'),
      server: response.headers.get('server'),
    });

    const contentType = response.headers.get('content-type');

    // Get the response body
    const bodyText = await response.text();

    // Log first 500 chars for debugging
    console.log('API Response body (first 500 chars):', bodyText.slice(0, 500));

    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        bodyPreview: bodyText.slice(0, 500),
      });
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    if (!contentType?.includes('application/json')) {
      console.error('Invalid response type:', {
        contentType,
        bodyPreview: bodyText.slice(0, 500),
      });
      throw new Error(`Expected JSON but got ${contentType}`);
    }

    let responseData;
    try {
      responseData = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('JSON parse error:', {
        parseError,
        bodyPreview: bodyText.slice(0, 500),
      });
      throw new Error('Failed to parse API response as JSON');
    }
    console.log('API Response received');

    // Extract matches from response (RapidAPI returns array directly)
    const data = Array.isArray(responseData) ? responseData : responseData.data || [];

    // Transform to internal format
    const matches = data.map((match: any) => ({
      id: match.id || `${match.homeTeam?.name}-vs-${match.awayTeam?.name}`,
      homeTeam: match.homeTeam?.name || 'Unknown',
      awayTeam: match.awayTeam?.name || 'Unknown',
      homeScore: match.score?.home || 0,
      awayScore: match.score?.away || 0,
      status: match.status || 'scheduled',
      league: match.league?.name || 'Football',
      startTime: match.startDate || new Date().toISOString(),
      venue: match.venue?.name || 'TBD',
    }));

    console.log(`Processed ${matches.length} matches`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        matches,
        source: 'api',
        provider: 'Highlightly',
        pagination: responseData.pagination || { totalCount: matches.length },
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Fetch error:', error);

    // Return mock data on error to allow development
    const mockMatches = [
      {
        id: 'match-1',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        homeScore: 2,
        awayScore: 1,
        status: 'live',
        league: 'Premier League',
        startTime: new Date().toISOString(),
        venue: 'Old Trafford',
      },
      {
        id: 'match-2',
        homeTeam: 'Chelsea',
        awayTeam: 'Arsenal',
        homeScore: 1,
        awayScore: 1,
        status: 'live',
        league: 'Premier League',
        startTime: new Date().toISOString(),
        venue: 'Stamford Bridge',
      },
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        matches: mockMatches,
        source: 'mock',
        error: error instanceof Error ? error.message : 'Unknown error - using mock data',
        pagination: { totalCount: mockMatches.length },
        timestamp: new Date().toISOString(),
      }),
    };
  }
};


export { handler };
