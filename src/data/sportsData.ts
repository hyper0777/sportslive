export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished' | 'scheduled' | 'halftime';
  startTime: string;
  league: string;
  venue: string;
  homeTeamColor: string;
  awayTeamColor: string;
  homeAbbr: string;
  awayAbbr: string;
  matchday: number;
  isFavorite?: boolean;
  odds?: {
    home: number;
    draw: number;
    away: number;
  };
  playByPlay?: PlayByPlayEvent[];
  stats?: MatchStats;
}

export interface PlayByPlayEvent {
  minute: number;
  type: 'goal' | 'yellow' | 'red' | 'substitution';
  team: string;
  player: string;
  description: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  passes: { home: number; away: number };
}

export interface Standing {
  rank: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string;
  league: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  publishedAt: string;
  category: string;
  featured: boolean;
  views: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  number: number;
  goals: number;
  assists: number;
  matches: number;
  nationality: string;
  league: string;
  trend: 'up' | 'down' | 'stable';
}

export const liveMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    homeScore: 2,
    awayScore: 1,
    status: 'live',
    startTime: '2024-01-15T19:30:00Z',
    league: 'Premier League',
    venue: 'Old Trafford',
    homeTeamColor: '#DA291C',
    awayTeamColor: '#C8102E',
    homeAbbr: 'MUN',
    awayAbbr: 'LIV',
    matchday: 22,
    isFavorite: false,
    odds: { home: 1.85, draw: 3.5, away: 4.2 },
    stats: {
      possession: { home: 58, away: 42 },
      shots: { home: 12, away: 8 },
      shotsOnTarget: { home: 5, away: 3 },
      corners: { home: 6, away: 4 },
      fouls: { home: 10, away: 12 },
      passes: { home: 487, away: 356 },
    },
  },
  {
    id: '2',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    homeScore: 1,
    awayScore: 1,
    status: 'live',
    startTime: '2024-01-15T20:00:00Z',
    league: 'Premier League',
    venue: 'Emirates Stadium',
    homeTeamColor: '#EF0107',
    awayTeamColor: '#034694',
    homeAbbr: 'ARS',
    awayAbbr: 'CHE',
    matchday: 22,
    isFavorite: true,
    odds: { home: 2.1, draw: 3.3, away: 3.4 },
    stats: {
      possession: { home: 52, away: 48 },
      shots: { home: 10, away: 9 },
      shotsOnTarget: { home: 4, away: 4 },
      corners: { home: 5, away: 3 },
      fouls: { home: 8, away: 11 },
      passes: { home: 421, away: 389 },
    },
  },
  {
    id: '3',
    homeTeam: 'Manchester City',
    awayTeam: 'Tottenham',
    homeScore: 3,
    awayScore: 0,
    status: 'live',
    startTime: '2024-01-15T15:00:00Z',
    league: 'Premier League',
    venue: 'Etihad Stadium',
    homeTeamColor: '#6CABDA',
    awayTeamColor: '#FFFFFF',
    homeAbbr: 'MCI',
    awayAbbr: 'TOT',
    matchday: 22,
    isFavorite: false,
    odds: { home: 1.45, draw: 4.2, away: 7.5 },
    stats: {
      possession: { home: 71, away: 29 },
      shots: { home: 18, away: 4 },
      shotsOnTarget: { home: 8, away: 1 },
      corners: { home: 9, away: 1 },
      fouls: { home: 6, away: 15 },
      passes: { home: 687, away: 278 },
    },
  },
  {
    id: '4',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    homeScore: 115,
    awayScore: 108,
    status: 'live',
    startTime: '2024-01-15T22:30:00Z',
    league: 'NBA',
    venue: 'Crypto.com Arena',
    homeTeamColor: '#552583',
    awayTeamColor: '#007A33',
    homeAbbr: 'LAL',
    awayAbbr: 'BOS',
    matchday: 35,
    isFavorite: false,
    odds: { home: 1.95, draw: 0, away: 1.95 },
    stats: {
      possession: { home: 0, away: 0 },
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      fouls: { home: 18, away: 20 },
      passes: { home: 0, away: 0 },
    },
  },
  {
    id: '5',
    homeTeam: 'Golden State Warriors',
    awayTeam: 'Denver Nuggets',
    homeScore: 98,
    awayScore: 105,
    status: 'halftime',
    startTime: '2024-01-15T23:00:00Z',
    league: 'NBA',
    venue: 'Chase Center',
    homeTeamColor: '#1D428A',
    awayTeamColor: '#0E2240',
    homeAbbr: 'GSW',
    awayAbbr: 'DEN',
    matchday: 34,
    isFavorite: true,
    odds: { home: 2.1, draw: 0, away: 1.8 },
    stats: {
      possession: { home: 0, away: 0 },
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      fouls: { home: 16, away: 14 },
      passes: { home: 0, away: 0 },
    },
  },
  {
    id: '6',
    homeTeam: 'Paris Saint-Germain',
    awayTeam: 'Marseille',
    homeScore: 2,
    awayScore: 2,
    status: 'live',
    startTime: '2024-01-15T20:45:00Z',
    league: 'Ligue 1',
    venue: 'Parc des Princes',
    homeTeamColor: '#004687',
    awayTeamColor: '#006BA6',
    homeAbbr: 'PSG',
    awayAbbr: 'OM',
    matchday: 20,
    isFavorite: false,
    odds: { home: 1.65, draw: 3.8, away: 5.5 },
    stats: {
      possession: { home: 62, away: 38 },
      shots: { home: 16, away: 7 },
      shotsOnTarget: { home: 6, away: 3 },
      corners: { home: 7, away: 2 },
      fouls: { home: 12, away: 14 },
      passes: { home: 512, away: 312 },
    },
  },
  {
    id: '7',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeScore: 1,
    awayScore: 0,
    status: 'finished',
    startTime: '2024-01-14T20:00:00Z',
    league: 'La Liga',
    venue: 'Santiago Bernabéu',
    homeTeamColor: '#FFFFFF',
    awayTeamColor: '#004687',
    homeAbbr: 'RMA',
    awayAbbr: 'FCB',
    matchday: 19,
    isFavorite: true,
    odds: { home: 2.3, draw: 3.4, away: 3.1 },
  },
  {
    id: '8',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    homeScore: 2,
    awayScore: 1,
    status: 'finished',
    startTime: '2024-01-14T18:30:00Z',
    league: 'Bundesliga',
    venue: 'Allianz Arena',
    homeTeamColor: '#DC052D',
    awayTeamColor: '#FFD700',
    homeAbbr: 'FCB',
    awayAbbr: 'BVB',
    matchday: 18,
    isFavorite: false,
    odds: { home: 1.55, draw: 4.5, away: 6.0 },
  },
  {
    id: '9',
    homeTeam: 'Inter Milan',
    awayTeam: 'AC Milan',
    homeScore: 0,
    awayScore: 0,
    status: 'live',
    startTime: '2024-01-15T19:45:00Z',
    league: 'Serie A',
    venue: 'San Siro',
    homeTeamColor: '#000000',
    awayTeamColor: '#DC0000',
    homeAbbr: 'INT',
    awayAbbr: 'ACM',
    matchday: 20,
    isFavorite: false,
    odds: { home: 2.0, draw: 3.4, away: 3.75 },
    stats: {
      possession: { home: 54, away: 46 },
      shots: { home: 8, away: 6 },
      shotsOnTarget: { home: 2, away: 2 },
      corners: { home: 3, away: 2 },
      fouls: { home: 11, away: 13 },
      passes: { home: 434, away: 372 },
    },
  },
  {
    id: '10',
    homeTeam: 'Miami Heat',
    awayTeam: 'New York Knicks',
    homeScore: 102,
    awayScore: 98,
    status: 'finished',
    startTime: '2024-01-15T20:00:00Z',
    league: 'NBA',
    venue: 'FTX Arena',
    homeTeamColor: '#98002E',
    awayTeamColor: '#0B2340',
    homeAbbr: 'MIA',
    awayAbbr: 'NYK',
    matchday: 36,
  },
  {
    id: '11',
    homeTeam: 'Manchester United',
    awayTeam: 'Brighton',
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    startTime: '2024-01-16T15:00:00Z',
    league: 'Premier League',
    venue: 'Old Trafford',
    homeTeamColor: '#DA291C',
    awayTeamColor: '#0057B8',
    homeAbbr: 'MUN',
    awayAbbr: 'BHA',
    matchday: 23,
    odds: { home: 1.72, draw: 3.7, away: 5.0 },
  },
  {
    id: '12',
    homeTeam: 'Newcastle United',
    awayTeam: 'Aston Villa',
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    startTime: '2024-01-16T19:45:00Z',
    league: 'Premier League',
    venue: 'St James Park',
    homeTeamColor: '#000000',
    awayTeamColor: '#95BFE5',
    homeAbbr: 'NEW',
    awayAbbr: 'AVL',
    matchday: 23,
    odds: { home: 1.85, draw: 3.6, away: 4.5 },
  },
  {
    id: '13',
    homeTeam: 'Lakers',
    awayTeam: 'Suns',
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    startTime: '2024-01-16T22:30:00Z',
    league: 'NBA',
    venue: 'Crypto.com Arena',
    homeTeamColor: '#552583',
    awayTeamColor: '#E56020',
    homeAbbr: 'LAL',
    awayAbbr: 'PHX',
    matchday: 36,
  },
  {
    id: '14',
    homeTeam: 'Juventus',
    awayTeam: 'Roma',
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    startTime: '2024-01-16T20:45:00Z',
    league: 'Serie A',
    venue: 'Allianz Stadium',
    homeTeamColor: '#000000',
    awayTeamColor: '#C91C1C',
    homeAbbr: 'JUV',
    awayAbbr: 'ROM',
    matchday: 21,
  },
  {
    id: '15',
    homeTeam: 'Liverpool',
    awayTeam: 'Everton',
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    startTime: '2024-01-17T20:00:00Z',
    league: 'Premier League',
    venue: 'Anfield',
    homeTeamColor: '#C8102E',
    awayTeamColor: '#003399',
    homeAbbr: 'LIV',
    awayAbbr: 'EVE',
    matchday: 23,
  },
];

export const standings: Standing[] = [
  {
    rank: 1,
    team: 'Manchester City',
    played: 22,
    wins: 18,
    draws: 3,
    losses: 1,
    goalsFor: 58,
    goalsAgainst: 15,
    goalDifference: 43,
    points: 57,
    form: 'WWWWW',
    league: 'Premier League',
  },
  {
    rank: 2,
    team: 'Arsenal',
    played: 22,
    wins: 16,
    draws: 4,
    losses: 2,
    goalsFor: 52,
    goalsAgainst: 20,
    goalDifference: 32,
    points: 52,
    form: 'WDWWW',
    league: 'Premier League',
  },
  {
    rank: 3,
    team: 'Liverpool',
    played: 22,
    wins: 15,
    draws: 5,
    losses: 2,
    goalsFor: 49,
    goalsAgainst: 18,
    goalDifference: 31,
    points: 50,
    form: 'WWWDW',
    league: 'Premier League',
  },
  {
    rank: 4,
    team: 'Aston Villa',
    played: 22,
    wins: 14,
    draws: 4,
    losses: 4,
    goalsFor: 45,
    goalsAgainst: 25,
    goalDifference: 20,
    points: 46,
    form: 'WLWWW',
    league: 'Premier League',
  },
  {
    rank: 5,
    team: 'Manchester United',
    played: 22,
    wins: 13,
    draws: 3,
    losses: 6,
    goalsFor: 42,
    goalsAgainst: 28,
    goalDifference: 14,
    points: 42,
    form: 'WDWLW',
    league: 'Premier League',
  },
  {
    rank: 6,
    team: 'Newcastle United',
    played: 22,
    wins: 12,
    draws: 5,
    losses: 5,
    goalsFor: 40,
    goalsAgainst: 26,
    goalDifference: 14,
    points: 41,
    form: 'WLWDW',
    league: 'Premier League',
  },
  {
    rank: 7,
    team: 'Chelsea',
    played: 22,
    wins: 11,
    draws: 4,
    losses: 7,
    goalsFor: 39,
    goalsAgainst: 31,
    goalDifference: 8,
    points: 37,
    form: 'LWWDL',
    league: 'Premier League',
  },
  {
    rank: 8,
    team: 'Tottenham Hotspur',
    played: 22,
    wins: 10,
    draws: 4,
    losses: 8,
    goalsFor: 36,
    goalsAgainst: 33,
    goalDifference: 3,
    points: 34,
    form: 'WDLLD',
    league: 'Premier League',
  },
  {
    rank: 9,
    team: 'Brighton & Hove Albion',
    played: 22,
    wins: 9,
    draws: 5,
    losses: 8,
    goalsFor: 33,
    goalsAgainst: 35,
    goalDifference: -2,
    points: 32,
    form: 'LDWDL',
    league: 'Premier League',
  },
  {
    rank: 10,
    team: 'West Ham United',
    played: 22,
    wins: 8,
    draws: 4,
    losses: 10,
    goalsFor: 31,
    goalsAgainst: 38,
    goalDifference: -7,
    points: 28,
    form: 'LWDLL',
    league: 'Premier League',
  },
];

export const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Manchester United Secure Dramatic Victory Against Liverpool',
    summary: 'In an thrilling encounter at Old Trafford, Manchester United came from behind to defeat Liverpool 2-1.',
    content:
      'Manchester United delivered an impressive performance against Liverpool, securing a crucial 2-1 victory. The match saw intense competition throughout, with both sides creating numerous chances.',
    image: 'https://images.pexels.com/photos/32285228/pexels-photo-32285228.jpeg',
    author: 'Sports Desk',
    publishedAt: '2024-01-15T15:30:00Z',
    category: 'Football',
    featured: true,
    views: 12540,
  },
  {
    id: '2',
    title: 'Lakers Edge Warriors in Thrilling NBA Matchup',
    summary: 'LeBron James leads the Lakers to a hard-fought 115-108 victory over the Golden State Warriors.',
    content:
      'The Los Angeles Lakers demonstrated their championship credentials with a convincing victory over the Warriors. James was instrumental in securing the win with stellar defensive plays.',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    author: 'NBA Correspondent',
    publishedAt: '2024-01-15T14:00:00Z',
    category: 'Basketball',
    featured: true,
    views: 8920,
  },
  {
    id: '3',
    title: 'Real Madrid Triumph Over Barcelona in El Clásico',
    summary: 'Real Madrid edges Barcelona 1-0 in a tense El Clásico encounter at the Bernabéu.',
    content:
      'Real Madrid secured a narrow but important victory over rival Barcelona. The match was tightly contested, with Real Madrid converting their chances effectively.',
    image: 'https://images.pexels.com/photos/104675/pexels-photo-104675.jpeg',
    author: 'La Liga Writer',
    publishedAt: '2024-01-14T18:45:00Z',
    category: 'Football',
    featured: false,
    views: 15680,
  },
  {
    id: '4',
    title: 'Paris Saint-Germain Draw with Marseille in Intense Derby',
    summary: 'PSG and Marseille battle to a 2-2 draw in an entertaining Ligue 1 clash.',
    content:
      'The Paris derby produced a thrilling match with both teams showcasing their attacking prowess. PSG controlled possession but Marseille showed remarkable resilience.',
    image: 'https://images.pexels.com/photos/32315910/pexels-photo-32315910.jpeg',
    author: 'Ligue 1 Editor',
    publishedAt: '2024-01-15T16:20:00Z',
    category: 'Football',
    featured: false,
    views: 6340,
  },
  {
    id: '5',
    title: 'Bayern Munich Dominates Dortmund in Bundesliga Clash',
    summary: 'Bayern Munich secures a 2-1 victory over Borussia Dortmund with an impressive performance.',
    content:
      'Bayern Munich demonstrated their quality with a commanding display against Dortmund. Their superior possession and clinical finishing proved decisive in the encounter.',
    image: 'https://images.pexels.com/photos/14070098/pexels-photo-14070098.jpeg',
    author: 'Bundesliga Correspondent',
    publishedAt: '2024-01-14T17:10:00Z',
    category: 'Football',
    featured: false,
    views: 7215,
  },
  {
    id: '6',
    title: 'Arsenal Draws With Chelsea in London Derby',
    summary: 'Arsenal and Chelsea play out an enthralling 1-1 draw at the Emirates Stadium.',
    content:
      'The London derby produced plenty of entertainment as Arsenal and Chelsea traded blows throughout the match. Both teams had opportunities to win but had to settle for a point.',
    image: 'https://images.pexels.com/photos/8312464/pexels-photo-8312464.jpeg',
    author: 'Premier League Writer',
    publishedAt: '2024-01-15T17:05:00Z',
    category: 'Football',
    featured: false,
    views: 9845,
  },
  {
    id: '7',
    title: 'NBA All-Star Selection Announced',
    summary: 'The 2024 NBA All-Star roster has been revealed, featuring the league\'s brightest talents.',
    content:
      'Basketball fans worldwide were treated to the announcement of the 2024 NBA All-Star game participants. The selection showcased the depth of talent across the league.',
    image: 'https://images.pexels.com/photos/10464472/pexels-photo-10464472.jpeg',
    author: 'NBA Editor',
    publishedAt: '2024-01-14T20:00:00Z',
    category: 'Basketball',
    featured: false,
    views: 11230,
  },
  {
    id: '8',
    title: 'Inter Milan Face AC Milan in San Siro Rivalry',
    summary: 'The Milan derby takes center stage as Inter hosts AC Milan at the San Siro.',
    content:
      'The stage is set for one of Italian football\'s fiercest rivalries. Inter and AC Milan bring their best to what promises to be a captivating encounter.',
    image: 'https://images.pexels.com/photos/31825810/pexels-photo-31825810.jpeg',
    author: 'Series A Correspondent',
    publishedAt: '2024-01-15T18:30:00Z',
    category: 'Football',
    featured: false,
    views: 8765,
  },
];

export const topPlayers: Player[] = [
  {
    id: '1',
    name: 'Erling Haaland',
    team: 'Manchester City',
    position: 'Forward',
    number: 9,
    goals: 21,
    assists: 5,
    matches: 22,
    nationality: 'Norway',
    league: 'Premier League',
    trend: 'up',
  },
  {
    id: '2',
    name: 'Harry Kane',
    team: 'Bayern Munich',
    position: 'Forward',
    number: 9,
    goals: 19,
    assists: 4,
    matches: 18,
    nationality: 'England',
    league: 'Bundesliga',
    trend: 'up',
  },
  {
    id: '3',
    name: 'Kylian Mbappé',
    team: 'Paris Saint-Germain',
    position: 'Forward',
    number: 7,
    goals: 18,
    assists: 6,
    matches: 20,
    nationality: 'France',
    league: 'Ligue 1',
    trend: 'stable',
  },
  {
    id: '4',
    name: 'Vinicius Jr',
    team: 'Real Madrid',
    position: 'Winger',
    number: 7,
    goals: 15,
    assists: 8,
    matches: 19,
    nationality: 'Brazil',
    league: 'La Liga',
    trend: 'up',
  },
  {
    id: '5',
    name: 'Luka Dončić',
    team: 'Dallas Mavericks',
    position: 'Guard',
    number: 77,
    goals: 0,
    assists: 8.2,
    matches: 35,
    nationality: 'Slovenia',
    league: 'NBA',
    trend: 'up',
  },
  {
    id: '6',
    name: 'Nikola Jokić',
    team: 'Denver Nuggets',
    position: 'Center',
    number: 15,
    goals: 0,
    assists: 9.1,
    matches: 34,
    nationality: 'Serbia',
    league: 'NBA',
    trend: 'stable',
  },
  {
    id: '7',
    name: 'Giannis Antetokounmpo',
    team: 'Milwaukee Bucks',
    position: 'Forward',
    number: 34,
    goals: 0,
    assists: 5.4,
    matches: 32,
    nationality: 'Greece',
    league: 'NBA',
    trend: 'down',
  },
  {
    id: '8',
    name: 'Kevin De Bruyne',
    team: 'Manchester City',
    position: 'Midfielder',
    number: 17,
    goals: 8,
    assists: 10,
    matches: 20,
    nationality: 'Belgium',
    league: 'Premier League',
    trend: 'stable',
  },
];

export const featuredMatch: Match = liveMatches[0];
