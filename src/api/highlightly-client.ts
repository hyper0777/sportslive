const API_BASE = 'https://sport-highlights-api.p.rapidapi.com';
const API_KEY = import.meta.env.VITE_HIGHLIGHTLY_API_KEY || '';
const API_HOST = 'sport-highlights-api.p.rapidapi.com';

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
      `API Error: ${response.status} - URL: ${url.toString()} - Response: ${errorDetails}`,
    );
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

// Types (simplified from OpenAPI spec)
export interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string;
}

export interface League {
  id: string;
  name: string;
  country?: string;
  logo?: string;
  season?: number;
}

export interface Team {
  id: string;
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

export interface Player {
  id: string;
  name: string;
  number?: number;
  position?: string;
  team: Team;
  country?: string;
  photo?: string;
}

export interface Standings {
  league: League;
  season: number;
  standings: {
    rank: number;
    team: Team;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  }[];
}

// Football API methods
export const football = {
  async getCountries(name?: string): Promise<Country[]> {
    return apiRequest('/football/countries', {
      params: name ? { name } : {},
    });
  },

  async getCountry(countryCode: string): Promise<Country> {
    return apiRequest(`/football/countries/${countryCode}`);
  },

  async getLeagues(params?: {
    country?: string;
    season?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: League[]; pagination?: any }> {
    return apiRequest('/football/leagues', { params });
  },

  async getLeague(id: string): Promise<League> {
    return apiRequest(`/football/leagues/${id}`);
  },

  async getTeams(params?: {
    country?: string;
    league?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Team[]; pagination?: any }> {
    return apiRequest('/football/teams', { params });
  },

  async getTeam(id: string): Promise<Team> {
    return apiRequest(`/football/teams/${id}`);
  },

  async getMatches(params?: {
    country?: string;
    league?: string;
    season?: number;
    status?: 'scheduled' | 'live' | 'finished';
    page?: number;
    limit?: number;
  }): Promise<{ data: Match[]; pagination?: any }> {
    return apiRequest('/football/matches', { params });
  },

  async getMatch(id: string): Promise<Match> {
    return apiRequest(`/football/matches/${id}`);
  },

  async getHighlights(params?: {
    country?: string;
    league?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Highlight[]; pagination?: any }> {
    return apiRequest('/football/highlights', { params });
  },

  async getHighlight(id: string): Promise<Highlight> {
    return apiRequest(`/football/highlights/${id}`);
  },

  async getStandings(params?: {
    league?: string;
    season?: number;
  }): Promise<Standings> {
    return apiRequest('/football/standings', { params });
  },

  async getPlayers(params?: {
    team?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Player[]; pagination?: any }> {
    return apiRequest('/football/players', { params });
  },

  async getPlayer(id: string): Promise<Player> {
    return apiRequest(`/football/players/${id}`);
  },

  async getLineups(matchId: string): Promise<any> {
    return apiRequest(`/football/lineups/${matchId}`);
  },

  async getStatistics(matchId: string): Promise<any> {
    return apiRequest(`/football/statistics/${matchId}`);
  },

  async getLiveEvents(matchId: string): Promise<any[]> {
    return apiRequest(`/football/events/${matchId}`);
  },

  async getOdds(params?: {
    match?: string;
    bookmaker?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; pagination?: any }> {
    return apiRequest('/football/odds', { params });
  },
};

// Basketball API methods (similar structure)
export const basketball = {
  async getMatches(params?: {
    league?: string;
    season?: number;
    status?: 'scheduled' | 'live' | 'finished';
    page?: number;
    limit?: number;
  }): Promise<{ data: Match[]; pagination?: any }> {
    return apiRequest('/basketball/matches', { params });
  },

  async getMatch(id: string): Promise<Match> {
    return apiRequest(`/basketball/matches/${id}`);
  },

  async getHighlights(params?: {
    league?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Highlight[]; pagination?: any }> {
    return apiRequest('/basketball/highlights', { params });
  },

  async getLeagues(params?: {
    season?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: League[]; pagination?: any }> {
    return apiRequest('/basketball/leagues', { params });
  },
};

// Hockey API methods
export const hockey = {
  async getMatches(params?: {
    league?: string;
    season?: number;
    status?: 'scheduled' | 'live' | 'finished';
    page?: number;
    limit?: number;
  }): Promise<{ data: Match[]; pagination?: any }> {
    return apiRequest('/hockey/matches', { params });
  },

  async getMatch(id: string): Promise<Match> {
    return apiRequest(`/hockey/matches/${id}`);
  },

  async getHighlights(params?: {
    league?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Highlight[]; pagination?: any }> {
    return apiRequest('/hockey/highlights', { params });
  },

  async getLeagues(params?: {
    season?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: League[]; pagination?: any }> {
    return apiRequest('/hockey/leagues', { params });
  },
};

// Rugby API methods
export const rugby = {
  async getMatches(params?: {
    league?: string;
    season?: number;
    status?: 'scheduled' | 'live' | 'finished';
    page?: number;
    limit?: number;
  }): Promise<{ data: Match[]; pagination?: any }> {
    return apiRequest('/rugby/matches', { params });
  },

  async getMatch(id: string): Promise<Match> {
    return apiRequest(`/rugby/matches/${id}`);
  },

  async getHighlights(params?: {
    league?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Highlight[]; pagination?: any }> {
    return apiRequest('/rugby/highlights', { params });
  },

  async getLeagues(params?: {
    season?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: League[]; pagination?: any }> {
    return apiRequest('/rugby/leagues', { params });
  },
};

// American Football API methods
export const americanFootball = {
  async getMatches(params?: {
    league?: string;
    season?: number;
    status?: 'scheduled' | 'live' | 'finished';
    page?: number;
    limit?: number;
  }): Promise<{ data: Match[]; pagination?: any }> {
    return apiRequest('/american-football/matches', { params });
  },

  async getMatch(id: string): Promise<Match> {
    return apiRequest(`/american-football/matches/${id}`);
  },

  async getHighlights(params?: {
    league?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Highlight[]; pagination?: any }> {
    return apiRequest('/american-football/highlights', { params });
  },
};

// Handball API methods
export const handball = {
  async getMatches(params?: {
    league?: string;
    season?: number;
    status?: 'scheduled' | 'live' | 'finished';
    page?: number;
    limit?: number;
  }): Promise<{ data: Match[]; pagination?: any }> {
    return apiRequest('/handball/matches', { params });
  },

  async getMatch(id: string): Promise<Match> {
    return apiRequest(`/handball/matches/${id}`);
  },

  async getHighlights(params?: {
    league?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Highlight[]; pagination?: any }> {
    return apiRequest('/handball/highlights', { params });
  },

  async getLeagues(params?: {
    season?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: League[]; pagination?: any }> {
    return apiRequest('/handball/leagues', { params });
  },
};
