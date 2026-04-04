import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RawMatch {
  [key: string]: unknown;
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

function getNestedValue(obj: Record<string, unknown>, path: string[]): unknown {
  return path.reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== 'object') {
      return undefined;
    }
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function normalizeMatches(payload: Record<string, unknown>): RawMatch[] {
  const candidates = ['matches', 'events', 'response', 'data'];

  for (const key of candidates) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value as RawMatch[];
    }
  }

  return [];
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

    console.log('Fetching from AllSportsAPI...');
    const response = await fetch('https://allsportsapi2.p.rapidapi.com/api/matches/live', {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'allsportsapi2.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}. Body=${errorText.slice(0, 300)}`
      );
    }

    const data = await response.json() as Record<string, unknown>;
    const rawMatches = normalizeMatches(data);

    if (rawMatches.length === 0) {
      return new Response(
        JSON.stringify({
          matches: [],
          source: 'api',
          message: 'No live matches available right now',
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const matches = rawMatches.slice(0, 20).map((match, index) => {
      const homeTeam = toString(
        getNestedValue(match, ['homeTeam', 'name']) ?? getNestedValue(match, ['teams', 'home', 'name']),
        'Home Team'
      );
      const awayTeam = toString(
        getNestedValue(match, ['awayTeam', 'name']) ?? getNestedValue(match, ['teams', 'away', 'name']),
        'Away Team'
      );
      const colors = teamColors[homeTeam] || { home: '#6B7280', away: '#9CA3AF' };
      const status =
        toString(match['statusType']) ||
        toString(getNestedValue(match, ['status', 'short']), 'NS');
      const league = toString(
        getNestedValue(match, ['tournament', 'name']) ?? getNestedValue(match, ['league', 'name']),
        'Unknown League'
      );
      const venue = toString(
        getNestedValue(match, ['venue', 'name']) ?? getNestedValue(match, ['venueName']),
        'TBD'
      );
      const startTime = toString(
        getNestedValue(match, ['startTimestamp']) ?? getNestedValue(match, ['fixture', 'date']),
        new Date().toISOString()
      );
      const homeScore = toNumber(
        getNestedValue(match, ['homeScore', 'current']) ?? getNestedValue(match, ['goals', 'home']),
        0
      );
      const awayScore = toNumber(
        getNestedValue(match, ['awayScore', 'current']) ?? getNestedValue(match, ['goals', 'away']),
        0
      );
      const rawId =
        getNestedValue(match, ['id']) ?? getNestedValue(match, ['fixture', 'id']) ?? `allsports-${index}`;

      return {
        id: `api-${String(rawId)}`,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        status: mapFixtureStatus(status),
        startTime,
        league,
        venue,
        homeTeamColor: colors.home,
        awayTeamColor: colors.away,
        homeAbbr: getTeamAbbreviation(homeTeam),
        awayAbbr: getTeamAbbreviation(awayTeam),
        matchday: 1,
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
          provider: 'AllSportsAPI',
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
