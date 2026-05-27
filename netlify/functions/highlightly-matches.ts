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
    const apiKey = process.env.FOOTBALL_HIGHLIGHTS_API_KEY;
    const apiHost = process.env.FOOTBALL_HIGHLIGHTS_API_HOST || 'football-highlights-api.p.rapidapi.com';

    if (!apiKey) {
      console.error('FOOTBALL_HIGHLIGHTS_API_KEY not configured');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'API key not configured',
          message: 'FOOTBALL_HIGHLIGHTS_API_KEY missing in environment variables',
          data: [],
          pagination: { totalCount: 0 },
        }),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const url = `https://${apiHost}/matches?date=${today}&limit=100`;

    console.log('Fetching from Football Highlights API:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Highlightly API request failed: ${response.status}. ${errorText.slice(0, 300)}`
      );
    }

    const responseData: any = await response.json();
    const rawMatches = responseData.response || responseData.matches || responseData.data || [];

    // Transform response to internal format
    const matches = rawMatches.map((match: any) => ({
      id: match.fixture?.id || `${match.homeTeam?.name || 'Home'}-vs-${match.awayTeam?.name || 'Away'}-${today}`,
      homeTeam: match.homeTeam?.name || match.teams?.home?.name || 'Home Team',
      awayTeam: match.awayTeam?.name || match.teams?.away?.name || 'Away Team',
      homeScore: match.goals?.home || match.score?.home || extractScore(match.state?.score?.current || '', 'home'),
      awayScore: match.goals?.away || match.score?.away || extractScore(match.state?.score?.current || '', 'away'),
      status: mapStatus(match.state?.description || match.fixture?.status || match.status || ''),
      league: match.league?.name || match.leagueName || 'Unknown',
      startTime: match.fixture?.date || match.date || new Date().toISOString(),
      venue: match.fixture?.venue?.name || match.venue || undefined,
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
        provider: 'Football Highlights',
        pagination: responseData.pagination || { totalCount: matches.length },
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
