import { liveMatches } from '@/data/sportsData';
import type { Match } from '@/data/sportsData';

interface APIFootballResponse {
  response: Array<{
    fixture: { id: number; status: { short: string; long: string } };
    teams: { home: { name: string }; away: { name: string } };
    goals: { home: number | null; away: number | null };
    venue: { name: string };
  }>;
}

// Simulated team color mapping
const teamColors: Record<string, { home: string; away: string }> = {
  'Manchester United': { home: '#DA291C', away: '#DA291C' },
  Liverpool: { home: '#C8102E', away: '#C8102E' },
  Arsenal: { home: '#EF0107', away: '#EF0107' },
  Chelsea: { home: '#034694', away: '#034694' },
  'Manchester City': { home: '#6CABDA', away: '#6CABDA' },
  Tottenham: { home: '#FFFFFF', away: '#FFFFFF' },
  'Paris Saint-Germain': { home: '#004687', away: '#004687' },
  Marseille: { home: '#006BA6', away: '#006BA6' },
  'Real Madrid': { home: '#FFFFFF', away: '#FFFFFF' },
  Barcelona: { home: '#004687', away: '#004687' },
  'Bayern Munich': { home: '#DC052D', away: '#DC052D' },
  'Borussia Dortmund': { home: '#FFD700', away: '#FFD700' },
  'Inter Milan': { home: '#000000', away: '#000000' },
  'AC Milan': { home: '#DC0000', away: '#DC0000' },
};

export async function handleLiveScoresRequest() {
  try {
    // Try to fetch from API-Football
    const apiKey = process.env.GATEWAY_API_KEY || 'a2d0f43bc98b633e315301fffe911c6edbca6a9';

    if (!apiKey) {
      throw new Error('No API key configured');
    }

    const response = await fetch('https://api-football-v1.p.rapidapi.com/v3/fixtures', {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data: APIFootballResponse = await response.json();

    // Transform API-Football data to match our format
    const matches = data.response.map((match): Match => {
      const homeTeam = match.teams.home.name;
      const awayTeam = match.teams.away.name;
      const colors = teamColors[homeTeam] || { home: '#6B7280', away: '#9CA3AF' };

      return {
        id: `api-${match.fixture.id}`,
        homeTeam,
        awayTeam,
        homeScore: match.goals.home || 0,
        awayScore: match.goals.away || 0,
        status: mapFixtureStatus(match.fixture.status.short),
        startTime: new Date().toISOString(),
        league: 'API Football',
        venue: match.venue.name,
        homeTeamColor: colors.home,
        awayTeamColor: colors.away,
        homeAbbr: homeTeam.substring(0, 3).toUpperCase(),
        awayAbbr: awayTeam.substring(0, 3).toUpperCase(),
        matchday: 1,
      };
    });

    return {
      matches,
      source: 'api' as const,
    };
  } catch (error) {
    // Fallback to simulated data with time-based score progression
    const now = new Date();
    const simulatedMatches = liveMatches.map((match) => {
      if (match.status === 'live') {
        // Simulate realistic time-based score progression
        const elapsed = Math.floor(Math.random() * 90); // Simulate game progress
        const progressFactor = elapsed / 90;

        // Add some randomness but keep scores realistic
        const homeScore = Math.floor(match.homeScore + Math.random() * progressFactor * 3);
        const awayScore = Math.floor(match.awayScore + Math.random() * progressFactor * 3);

        return {
          ...match,
          homeScore,
          awayScore,
        };
      }
      return match;
    });

    return {
      matches: simulatedMatches,
      source: 'simulated' as const,
      error: `Using fallback simulated data: ${error instanceof Error ? error.message : 'API unavailable'}`,
    };
  }
}

function mapFixtureStatus(status: string): 'live' | 'finished' | 'scheduled' | 'halftime' {
  const statusMap: Record<string, 'live' | 'finished' | 'scheduled' | 'halftime'> = {
    NS: 'scheduled', // Not started
    '1H': 'live', // First half
    HT: 'halftime', // Halftime
    '2H': 'live', // Second half
    ET: 'live', // Extra time
    P: 'live', // Penalty
    FT: 'finished', // Finished
    AET: 'finished', // After extra time
    PEN: 'finished', // Penalties
    PST: 'finished', // Postponed
    CANC: 'finished', // Cancelled
    ABD: 'finished', // Abandoned
    TBD: 'scheduled', // To be defined
    SUSP: 'live', // Suspended
  };

  return statusMap[status] || 'scheduled';
}

// Export for use as an API route or function
export default handleLiveScoresRequest;
