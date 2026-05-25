import { Handler } from '@netlify/functions';

type MatchStatus = 'live' | 'finished' | 'scheduled' | 'halftime';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  league: string;
  startTime: string;
  venue?: string;
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
    const apiKey = process.env.FOOTBALL_API_KEY;
    const provider = (process.env.FOOTBALL_API_PROVIDER || 'apisports').toLowerCase();

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'FOOTBALL_API_KEY not configured',
          message: 'API key missing in environment variables',
          matches: [],
          source: 'error',
        }),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const endpoint =
      provider === 'apisports'
        ? `https://v3.football.api-sports.io/fixtures?date=${today}&timezone=UTC`
        : `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}&timezone=UTC`;

    const headers: Record<string, string> =
      provider === 'apisports'
        ? { 'x-apisports-key': apiKey }
        : {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
          };

    const response = await fetch(endpoint, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status}. Provider: ${provider}. ${errorText.slice(0, 200)}`
      );
    }

    const data = await response.json();
    const matches = transformFixtures(data.response || []);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        matches,
        source: 'api',
        provider,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Live scores error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to fetch live scores',
        message: error instanceof Error ? error.message : 'Unknown error',
        matches: [],
        source: 'error',
      }),
    };
  }
};

function transformFixtures(fixtures: any[]): Match[] {
  return fixtures
    .filter((fixture) => fixture?.fixture?.id && fixture?.teams?.home?.name)
    .map((fixture) => {
      const status = mapStatus(fixture.fixture.status.short);
      return {
        id: `api-${fixture.fixture.id}`,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeScore: fixture.goals.home || 0,
        awayScore: fixture.goals.away || 0,
        status,
        league: fixture.league.name,
        startTime: fixture.fixture.date,
        venue: fixture.fixture.venue?.name,
      };
    });
}

function mapStatus(status: string): MatchStatus {
  const normalized = status.toUpperCase();
  const statusMap: Record<string, MatchStatus> = {
    NS: 'scheduled',
    TBD: 'scheduled',
    '1H': 'live',
    '2H': 'live',
    HT: 'halftime',
    FT: 'finished',
  };
  return statusMap[normalized] || 'scheduled';
}

export { handler };
