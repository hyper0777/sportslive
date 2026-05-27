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
      const bodyText = await response.text();
      console.error('Invalid response type:', {
        contentType,
        body: bodyText.slice(0, 500),
      });
      throw new Error(`Expected JSON but got ${contentType}`);
    }

    const responseData = await response.json();
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
