import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface APIFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
      elapsed: number | null;
    };
    venue: {
      name: string;
      city: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
}

interface APIFootballResponse {
  get: string;
  parameters: Record<string, string>;
  errors: Record<string, unknown>;
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: APIFootballFixture[];
}

const teamColors: Record<string, { home: string; away: string }> = {
  'Manchester United': { home: '#DA291C', away: '#DA291C' },
  'Liverpool': { home: '#C8102E', away: '#C8102E' },
  'Arsenal': { home: '#EF0107', away: '#EF0107' },
  'Chelsea': { home: '#034694', away: '#034694' },
  'Manchester City': { home: '#6CABDA', away: '#6CABDA' },
  'Tottenham': { home: '#FFFFFF', away: '#FFFFFF' },
  'Paris Saint-Germain': { home: '#004687', away: '#004687' },
  'Marseille': { home: '#006BA6', away: '#006BA6' },
  'Real Madrid': { home: '#FFFFFF', away: '#FFFFFF' },
  'Barcelona': { home: '#004687', away: '#004687' },
  'Bayern Munich': { home: '#DC052D', away: '#DC052D' },
  'Borussia Dortmund': { home: '#FFD700', away: '#FFD700' },
  'Inter Milan': { home: '#000000', away: '#000000' },
  'AC Milan': { home: '#DC0000', away: '#DC0000' },
};

function mapFixtureStatus(status: string): 'live' | 'finished' | 'scheduled' | 'halftime' {
  const statusMap: Record<string, 'live' | 'finished' | 'scheduled' | 'halftime'> = {
    'NS': 'scheduled',
    'TBD': 'scheduled',
    '1H': 'live',
    'HT': 'halftime',
    '2H': 'live',
    'ET': 'live',
    'P': 'live',
    'FT': 'finished',
    'AET': 'finished',
    'PEN': 'finished',
    'PST': 'finished',
    'CANC': 'finished',
    'ABD': 'finished',
    'SUSP': 'live',
  };

  return statusMap[status] || 'scheduled';
}

function getTeamAbbreviation(teamName: string): string {
  const words = teamName.split(' ');
  if (words.length === 1) {
    return teamName.substring(0, 3).toUpperCase();
  }
  return words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get('FOOTBALL_API_KEY');

    if (!apiKey) {
      throw new Error('FOOTBALL_API_KEY not configured');
    }

    const today = new Date().toISOString().split('T')[0];

    const response = await fetch(
      `https://allsportsapi2.p.rapidapi.com/api/matches/live?date=${today}&timezone=UTC`,
      {
        headers: {
          'x-rapidapi-key': b9c6883414msh11dde2eba098703p1a13fdjsne11249e78db1,
          'x-rapidapi-host': 'allsportsapi2.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: APIFootballResponse = await response.json();

    if (!data.response || data.response.length === 0) {
      return new Response(
        JSON.stringify({
          matches: [],
          source: 'api',
          message: 'No matches available for today',
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const matches = data.response.slice(0, 20).map((fixture) => {
      const homeTeam = fixture.teams.home.name;
      const awayTeam = fixture.teams.away.name;
      const colors = teamColors[homeTeam] || { home: '#6B7280', away: '#9CA3AF' };

      return {
        id: `api-${fixture.fixture.id}`,
        homeTeam,
        awayTeam,
        homeScore: fixture.goals.home || 0,
        awayScore: fixture.goals.away || 0,
        status: mapFixtureStatus(fixture.fixture.status.short),
        startTime: fixture.fixture.date,
        league: fixture.league.name,
        venue: fixture.fixture.venue.name || 'TBD',
        homeTeamColor: colors.home,
        awayTeamColor: colors.away,
        homeAbbr: getTeamAbbreviation(homeTeam),
        awayAbbr: getTeamAbbreviation(awayTeam),
        matchday: parseInt(fixture.league.round.match(/\d+/)?.[0] || '1'),
        isFavorite: false,
        stats: {
          possession: { home: 50, away: 50 },
          shots: { home: 0, away: 0 },
          shotsOnTarget: { home: 0, away: 0 },
          corners: { home: 0, away: 0 },
          fouls: { home: 0, away: 0 },
          passes: { home: 0, away: 0 },
        },
      };
    });

    return new Response(
      JSON.stringify({
        matches,
        source: 'api',
        apiInfo: {
          provider: 'API-Football',
          matchCount: matches.length,
          timestamp: new Date().toISOString(),
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching live scores:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        matches: [],
        source: 'error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
