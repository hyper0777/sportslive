import { Handler } from '@netlify/functions';

interface MatchEvent {
  id: string;
  type: 'goal' | 'card' | 'substitution' | 'corner' | 'foul' | 'other';
  minute: number;
  team: string;
  player?: string;
  playerOut?: string;
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
          events: [],
          matchId,
          source: 'error',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    const url = `${baseUrl}/football/events/${encodeURIComponent(matchId)}`;

    console.log('Fetching match events from Highlightly API:', url);

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

    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      throw new Error(
        `Failed to parse API response as JSON. Got: ${text.slice(0, 100)}`
      );
    }

    // Transform response to match our interface
    const events: MatchEvent[] = Array.isArray(data)
      ? data.map((event: any, index: number) => ({
          id: event.id || `event-${index}`,
          type: mapEventType(event.type || event.eventType || 'other'),
          minute: event.minute || event.matchMinute || 0,
          team: event.team || event.teamName || 'Unknown',
          player: event.player || event.playerName,
          playerOut: event.playerOut || event.playerOutName,
          description:
            event.description ||
            formatEventDescription(event),
        }))
      : data.events && Array.isArray(data.events)
        ? data.events.map((event: any, index: number) => ({
            id: event.id || `event-${index}`,
            type: mapEventType(event.type || event.eventType || 'other'),
            minute: event.minute || event.matchMinute || 0,
            team: event.team || event.teamName || 'Unknown',
            player: event.player || event.playerName,
            playerOut: event.playerOut || event.playerOutName,
            description:
              event.description ||
              formatEventDescription(event),
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
    console.error('Highlightly events API error:', error);
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

function mapEventType(
  eventType: string
): 'goal' | 'card' | 'substitution' | 'corner' | 'foul' | 'other' {
  const type = eventType?.toLowerCase() || '';
  if (type.includes('goal')) return 'goal';
  if (
    type.includes('card') ||
    type.includes('yellow') ||
    type.includes('red')
  )
    return 'card';
  if (
    type.includes('substitution') ||
    type.includes('sub') ||
    type.includes('replace')
  )
    return 'substitution';
  if (type.includes('corner')) return 'corner';
  if (type.includes('foul') || type.includes('tackle')) return 'foul';
  return 'other';
}

function formatEventDescription(event: any): string {
  const minute = event.minute || event.matchMinute || 0;
  const player = event.player || event.playerName || 'Unknown';
  const type = event.type || event.eventType || 'Event';

  if (event.type?.includes('substitution') || event.eventType?.includes('substitution')) {
    const playerOut = event.playerOut || event.playerOutName || 'Unknown';
    return `${minute}' - ${playerOut} → ${player}`;
  }

  return `${minute}' - ${player} (${type})`;
}

export { handler };
