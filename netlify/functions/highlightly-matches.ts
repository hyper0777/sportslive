import { Handler } from '@netlify/functions';

interface HighlightlyMatch {
  homeTeam: { name: string };
  awayTeam: { name: string };
  state: {
    score: { current: string };
    description: string;
  };
  [key: string]: unknown;
}

interface HighlightlyResponse {
  data: HighlightlyMatch[];
  pagination: {
    totalCount: number;
  };
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
    const apiKey = process.env.HIGHLIGHTLY_API_KEY;
    const baseUrl = process.env.HIGHLIGHTLY_BASE_URL || 'https://sports.highlightly.net';

    if (!apiKey) {
      console.error('HIGHLIGHTLY_API_KEY not configured');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'API key not configured',
          message: 'HIGHLIGHTLY_API_KEY missing in environment variables',
          data: [],
          pagination: { totalCount: 0 },
        }),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const url = `${baseUrl}/football/matches?date=${today}&limit=100`;

    console.log('Fetching from Highlightly API:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Highlightly API request failed: ${response.status}. ${errorText.slice(0, 300)}`
      );
    }

    const data: HighlightlyResponse = await response.json();

    // Transform response to internal format
    const matches = data.data.map((match) => ({
      id: `${match.homeTeam.name}-vs-${match.awayTeam.name}-${today}`,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeScore: extractScore(match.state.score.current, 'home'),
      awayScore: extractScore(match.state.score.current, 'away'),
      status: mapStatus(match.state.description),
      league: 'Unknown', // Adjust if available in response
      startTime: new Date().toISOString(),
      venue: undefined,
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
        provider: 'Highlightly',
        pagination: data.pagination,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Highlightly API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to fetch matches',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        pagination: { totalCount: 0 },
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
  const desc = description.toLowerCase();
  if (desc.includes('live') || desc.includes('first half') || desc.includes('second half')) return 'live';
  if (desc.includes('halftime') || desc.includes('half time')) return 'halftime';
  if (desc.includes('finished') || desc.includes('full time') || desc.includes('ended')) return 'finished';
  return 'scheduled';
}

export { handler };
