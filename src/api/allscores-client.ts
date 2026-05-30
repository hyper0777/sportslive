const API_BASE = 'https://allscores.p.rapidapi.com/api/allscores';
const API_KEY = import.meta.env.VITE_HIGHLIGHTLY_API_KEY || '';
const API_HOST = 'allscores.p.rapidapi.com';

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
      `AllScores API Error: ${response.status} - URL: ${url.toString()} - Response: ${errorDetails}`,
    );
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export interface NewsItem {
  id?: string;
  title: string;
  description?: string;
  content?: string;
  source?: string;
  date?: string;
  timestamp?: number;
  image?: string;
  url?: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date?: string;
  status?: string;
  league?: string;
}

export interface League {
  id: string;
  name: string;
  country?: string;
  season?: number;
}

// Sports IDs for AllScores API
export const SPORT_IDS = {
  FOOTBALL: 1,
  BASKETBALL: 2,
  TENNIS: 3,
  BASEBALL: 4,
  HOCKEY: 5,
};

// AllScores API methods
export const allscores = {
  async getNews(params?: {
    sport?: number;
    timezone?: string;
    langId?: number;
    limit?: number;
  }): Promise<{ news?: NewsItem[]; data?: NewsItem[] }> {
    return apiRequest('/news', { params });
  },

  async getMatches(params?: {
    sport?: number;
    timezone?: string;
    langId?: number;
    limit?: number;
  }): Promise<{ matches?: Match[]; data?: Match[] }> {
    return apiRequest('/matches', { params });
  },

  async getLiveMatches(params?: {
    sport?: number;
    timezone?: string;
    langId?: number;
  }): Promise<{ matches?: Match[]; data?: Match[] }> {
    return apiRequest('/live', { params });
  },

  async getLeagues(params?: {
    sport?: number;
    langId?: number;
  }): Promise<{ leagues?: League[]; data?: League[] }> {
    return apiRequest('/leagues', { params });
  },

  async getTeams(params?: {
    sport?: number;
    leagueId?: string;
    langId?: number;
  }): Promise<{ teams?: any[]; data?: any[] }> {
    return apiRequest('/teams', { params });
  },

  async getStandings(params?: {
    sport?: number;
    leagueId?: string;
    season?: number;
    langId?: number;
  }): Promise<any> {
    return apiRequest('/standings', { params });
  },
};
