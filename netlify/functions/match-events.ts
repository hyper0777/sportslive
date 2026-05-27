import { Handler } from '@netlify/functions';

interface MatchEvent {
  id: string;
  type: 'goal' | 'card' | 'substitution' | 'other';
  minute: number;
  player: string;
  team: string;
  description: string;
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
          events: [],
          matchId: '',
          source: 'error',
          timestamp: new Date().toISOString(),
        }),
      };
    }

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
          events: [],
          matchId,
          source: 'error',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    const url = `https://${apiHost}/events/${encodeURIComponent(matchId)}`;

    console.log('Fetching match events from:', url);

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
    const events: MatchEvent[] = Array.isArray(data)
      ? data.map((event: any) => ({
          id: event.id || `${event.minute}-${event.player}`,
          type: mapEventType(event.type || event.eventType),
          minute: event.minute || event.matchMinute || 0,
          player: event.player || event.playerName || 'Unknown',
          team: event.team || event.teamName || 'Unknown',
          description: event.description || formatEventDescription(event),
        }))
      : data.events && Array.isArray(data.events)
        ? data.events.map((event: any) => ({
            id: event.id || `${event.minute}-${event.player}`,
            type: mapEventType(event.type || event.eventType),
            minute: event.minute || event.matchMinute || 0,
            player: event.player || event.playerName || 'Unknown',
            team: event.team || event.teamName || 'Unknown',
            description: event.description || formatEventDescription(event),
          }))
        : [];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        events,
        matchId,
        source: 'api',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Match events API error:', error);
    const matchId = event.queryStringParameters?.id || '';
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to fetch match events',
        message: error instanceof Error ? error.message : 'Unknown error',
        events: [],
        matchId,
        source: 'error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

function mapEventType(eventType: string): 'goal' | 'card' | 'substitution' | 'other' {
  const type = eventType?.toLowerCase() || '';
  if (type.includes('goal')) return 'goal';
  if (type.includes('card') || type.includes('yellow') || type.includes('red')) return 'card';
  if (type.includes('substitution') || type.includes('sub') || type.includes('replace')) return 'substitution';
  return 'other';
}

function formatEventDescription(event: any): string {
  const minute = event.minute || event.matchMinute || 0;
  const player = event.player || event.playerName || 'Unknown';
  const type = event.type || event.eventType || 'Event';
  return `${minute}'  ${player} - ${type}`;
}

export { handler };
