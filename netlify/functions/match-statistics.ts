import { Handler } from '@netlify/functions';

interface TeamStats {
  team: string;
  possession: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passAccuracy: number;
  tackles: number;
  fouls: number;
  offsides: number;
  corners: number;
  yellowCards: number;
  redCards: number;
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
    const matchId = event.queryStringParameters?.id;

    if (!matchId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing match ID',
          message: 'Please provide an id query parameter',
          matchId: '',
          homeTeam: {},
          awayTeam: {},
          source: 'error',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    const apiKey = process.env.SPORT_HIGHLIGHTS_API_KEY;
    const apiHost = process.env.SPORT_HIGHLIGHTS_API_HOST || 'sport-highlights-api.p.rapidapi.com';

    if (!apiKey) {
      console.error('SPORT_HIGHLIGHTS_API_KEY not configured');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'API key not configured',
          message: 'SPORT_HIGHLIGHTS_API_KEY missing in environment variables',
          matchId,
          homeTeam: {},
          awayTeam: {},
          source: 'error',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    const url = `https://${apiHost}/football/statistics/${encodeURIComponent(matchId)}`;

    console.log('Fetching match statistics from Sport Highlights API:', url);

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
      throw new Error(`API request failed: ${response.status}. ${errorText.slice(0, 300)}`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      throw new Error(`Failed to parse API response as JSON. Got: ${text.slice(0, 100)}`);
    }

    // Transform response to match our interface
    const homeTeam = parseTeamStats(data?.home || data?.homeTeam || {}, 'home');
    const awayTeam = parseTeamStats(data?.away || data?.awayTeam || {}, 'away');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        matchId,
        homeTeam,
        awayTeam,
        source: 'api',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Match statistics API error:', error);
    const matchId = event.queryStringParameters?.id || '';
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to fetch match statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
        matchId,
        homeTeam: {},
        awayTeam: {},
        source: 'error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

function parseTeamStats(data: any, side: 'home' | 'away'): TeamStats {
  const teamName = data.team || data.teamName || (side === 'home' ? 'Home' : 'Away');

  return {
    team: teamName,
    possession: parseFloat(data.possession || data.possessionPercentage || 0),
    shots: parseInt(data.shots || data.totalShots || 0, 10),
    shotsOnTarget: parseInt(data.shotsOnTarget || data.onTarget || 0, 10),
    passes: parseInt(data.passes || data.totalPasses || 0, 10),
    passAccuracy: parseFloat(data.passAccuracy || data.passPercentage || 0),
    tackles: parseInt(data.tackles || data.totalTackles || 0, 10),
    fouls: parseInt(data.fouls || data.totalFouls || 0, 10),
    offsides: parseInt(data.offsides || 0, 10),
    corners: parseInt(data.corners || data.totalCorners || 0, 10),
    yellowCards: parseInt(data.yellowCards || data.yellowCard || 0, 10),
    redCards: parseInt(data.redCards || data.redCard || 0, 10),
  };
}

export { handler };
