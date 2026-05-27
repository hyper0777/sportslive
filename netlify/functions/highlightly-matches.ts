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
    // Try multiple env var names since they seem to have truncation issues
    const apiKey = process.env.FOOTBALL_HIGHLIGHTS_API_KEY || 
                   process.env.FOOTBALL_HIGHLIGHTS_API_K ||
                   process.env.FOOTBALL_HIGHLIGHTS_API ||
                   process.env.FOOTBALL_HIGHLIGHTS;

    if (!apiKey) {
      console.error('API key not found in environment variables');
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
    const baseUrl = 'https://sports.highlightly.net';
    const url = `${baseUrl}/football/matches?date=${today}&limit=100`;

    console.log('Fetching from Highlightly API:', url);
    console.log('Using API key:', apiKey.slice(0, 10) + '...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
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

    // Extract matches from response
    const data = responseData.data || [];
    
    // Transform to internal format
    const matches = data.map((match: any) => ({
      id: `${match.homeTeam.name}-vs-${match.awayTeam.name}-${today}`,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeScore: extractScore(match.state.score.current, 'home'),
      awayScore: extractScore(match.state.score.current, 'away'),
      status: mapStatus(match.state.description),
      league: match.league?.name || 'Football',
      startTime: match.startDate || new Date().toISOString(),
      venue: match.venue?.name,
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

function extractScore(scoreString: string, team: 'home' | 'away'): number {
  if (!scoreString) return 0;
  const parts = scoreString.split('-');
  if (team === 'home') return parseInt(parts[0]?.trim() || '0', 10);
  return parseInt(parts[1]?.trim() || '0', 10);
}

function mapStatus(description: string): 'live' | 'finished' | 'scheduled' | 'halftime' {
  const desc = (description || '').toLowerCase();
  if (desc.includes('live') || desc.includes('first half') || desc.includes('second half')) return 'live';
  if (desc.includes('halftime') || desc.includes('half time')) return 'halftime';
  if (desc.includes('finished') || desc.includes('full time') || desc.includes('ended')) return 'finished';
  return 'scheduled';
}

export { handler };
