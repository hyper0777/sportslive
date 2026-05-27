import { Handler } from '@netlify/functions';

interface Country {
  id: string;
  name: string;
  code?: string;
  flag?: string;
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
    const name = event.queryStringParameters?.name;

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
          countries: [],
          source: 'error',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // Build URL with optional name parameter
    const baseUrl = `https://${apiHost}/countries`;
    const url = name ? `${baseUrl}?name=${encodeURIComponent(name)}` : baseUrl;

    console.log('Fetching countries from RapidAPI:', url);

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
    const countries: Country[] = Array.isArray(data)
      ? data.map((country: any) => ({
          id: country.id || country.name?.toLowerCase().replace(/\s+/g, '-'),
          name: country.name || 'Unknown',
          code: country.code || country.countryCode,
          flag: country.flag || country.flagUrl,
        }))
      : data.response && Array.isArray(data.response)
        ? data.response.map((country: any) => ({
            id: country.id || country.name?.toLowerCase().replace(/\s+/g, '-'),
            name: country.name || 'Unknown',
            code: country.code || country.countryCode,
            flag: country.flag || country.flagUrl,
          }))
        : [];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        countries,
        source: 'api',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Countries API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to fetch countries',
        message: error instanceof Error ? error.message : 'Unknown error',
        countries: [],
        source: 'error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

export { handler };
