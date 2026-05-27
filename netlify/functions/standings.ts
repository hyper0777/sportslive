import { Handler } from '@netlify/functions';

interface StandingEntry {
  rank: number;
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  [key: string]: unknown;
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
          standings: [],
          league: { id: 0, name: 'Unknown' },
          season: 2025,
          source: 'error',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // Get league and season from query parameters
    const leagueId = event.queryStringParameters?.leagueId || '104';
    const season = event.queryStringParameters?.season || '2025';

    const url = `${baseUrl}/football/standings?leagueId=${leagueId}&season=${season}`;

    console.log('Fetching standings from Highlightly API:', url);

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

    const data = await response.json();

    // Transform the response to match our interface
    const standings: StandingEntry[] = Array.isArray(data)
      ? data.map((entry: any, index: number) => ({
          rank: entry.rank || index + 1,
          teamId: entry.teamId || entry.team?.id || 0,
          teamName: entry.teamName || entry.team?.name || 'Unknown',
          played: entry.played || entry.matches || 0,
          wins: entry.wins || entry.w || 0,
          draws: entry.draws || entry.d || 0,
          losses: entry.losses || entry.l || 0,
          goalsFor: entry.goalsFor || entry.gf || 0,
          goalsAgainst: entry.goalsAgainst || entry.ga || 0,
          goalDifference: entry.goalDifference || entry.gd || 0,
          points: entry.points || entry.pts || 0,
        }))
      : [];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        standings,
        league: {
          id: parseInt(leagueId, 10),
          name: getLeagueName(parseInt(leagueId, 10)),
        },
        season: parseInt(season, 10),
        source: 'api',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Standings API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to fetch standings',
        message: error instanceof Error ? error.message : 'Unknown error',
        standings: [],
        league: { id: 0, name: 'Unknown' },
        season: 2025,
        source: 'error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

function getLeagueName(leagueId: number): string {
  const leagueMap: { [key: number]: string } = {
    104: 'Premier League',
    135: 'Serie A',
    61: 'La Liga',
    61: 'Ligue 1',
    364: 'MLS',
  };
  return leagueMap[leagueId] || `League ${leagueId}`;
}

export { handler };
