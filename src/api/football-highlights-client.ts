const API_BASE = 'https://football-highlights-api.p.rapidapi.com';
const API_KEY = import.meta.env.VITE_HIGHLIGHTLY_API_KEY || '';
const API_HOST = 'football-highlights-api.p.rapidapi.com';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  if (!API_KEY) {
    throw new Error('VITE_HIGHLIGHTLY_API_KEY environment variable is not set');
  }

  const url = new URL(`${API_BASE}${endpoint}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'x-rapidapi-host': API_HOST,
      'x-rapidapi-key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorBody = await response.json();
      errorDetails = JSON.stringify(errorBody);
    } catch {
      errorDetails = await response.text();
    }
    console.error(
      `Football Highlights API Error: ${response.status} - URL: ${url.toString()} - Response: ${errorDetails}`,
    );
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export interface Country {
  id?: string;
  name: string;
  code?: string;
  flag?: string;
}

export interface League {
  id?: string;
  name: string;
  country?: string;
  logo?: string;
  season?: number;
}

export interface Team {
  id?: string;
  name: string;
  logo?: string;
  country?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  league: League;
  startDate: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled';
  score?: {
    home: number;
    away: number;
  };
}

export interface Highlight {
  id: string;
  match: Match;
  title: string;
  duration: number;
  videoUrl?: string;
  thumbnail?: string;
  createdAt: string;
}

// Football Highlights API methods
export const footballHighlights = {
  async getCountries(params?: {
    name?: string;
    code?: string;
  }): Promise<Country[]> {
    return apiRequest('/countries', { params });
  },

  async getCountry(countryCode: string): Promise<Country> {
    return apiRequest(`/countries/${countryCode}`);
  },

  async getLeagues(params?: {
    country?: string;
    season?: number;
    page?: number;
    limit?: number;
  }): Promise<League[]> {
    return apiRequest('/leagues', { params });
  },

  async getLeague(id: string): Promise<League> {
    return apiRequest(`/leagues/${id}`);
  },

  async getTeams(params?: {
    country?: string;
    league?: string;
    page?: number;
    limit?: number;
  }): Promise<Team[]> {
    return apiRequest('/teams', { params });
  },

  async getTeam(id: string): Promise<Team> {
    return apiRequest(`/teams/${id}`);
  },

  async getMatches(params?: {
    country?: string;
    league?: string;
    season?: number;
    status?: 'scheduled' | 'live' | 'finished';
    page?: number;
    limit?: number;
  }): Promise<Match[]> {
    return apiRequest('/matches', { params });
  },

  async getMatch(id: string): Promise<Match> {
    return apiRequest(`/matches/${id}`);
  },

  async getHighlights(params?: {
    country?: string;
    league?: string;
    page?: number;
    limit?: number;
  }): Promise<Highlight[]> {
    return apiRequest('/highlights', { params });
  },

  async getHighlight(id: string): Promise<Highlight> {
    return apiRequest(`/highlights/${id}`);
  },
};
