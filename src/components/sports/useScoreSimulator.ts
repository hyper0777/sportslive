import { useEffect, useState } from 'react';
import { Match } from '@/data/sportsData';
import { fetchFootballHighlights } from '@/api/football-highlights';

interface ScoreSimulatorState {
  matches: Match[];
  source: 'api' | 'simulated' | 'edge-function';
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useScoreSimulator(initialMatches: Match[]) {
  const [state, setState] = useState<ScoreSimulatorState>({
    matches: initialMatches,
    source: 'simulated',
    loading: false,
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchScores = async () => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        const today = new Date().toISOString().split('T')[0];

        console.log('Fetching matches from Football Highlights API for:', today);

        const data = await fetchFootballHighlights({
          date: today,
          limit: 100,
          offset: 0,
          timezone: 'Etc/UTC',
        });

        console.log('Football Highlights API response received:', data);

        if (data && data.matches && Array.isArray(data.matches) && data.matches.length > 0) {
          if (isMounted) {
            // Transform highlights API response to Match format
            const transformedMatches = data.matches.map((match: any) => ({
              id: match.id || `match-${match.homeTeamId}-${match.awayTeamId}`,
              homeTeam: match.homeTeamName || match.home_team_name || 'Home Team',
              awayTeam: match.awayTeamName || match.away_team_name || 'Away Team',
              homeScore: match.homeGoals ?? match.home_goals ?? 0,
              awayScore: match.awayGoals ?? match.away_goals ?? 0,
              status: mapHighlightsStatus(match.statusShort || match.status?.short || 'NS'),
              league: match.leagueName || match.league_name || 'Unknown League',
              startTime: match.date || match.fixture_date || new Date().toISOString(),
              venue: match.venueName || match.venue_name,
            }));

            setState((prev) => ({
              ...prev,
              matches: transformedMatches,
              source: 'api',
              loading: false,
              error: null,
              lastUpdated: new Date(),
            }));
          }
        } else {
          throw new Error(data?.message || 'No matches available from API');
        }
      } catch (err) {
        // Fallback to simulated data
        if (isMounted) {
          const simulatedMatches = initialMatches.map((match) => {
            if (match.status === 'live') {
              // Randomly update scores
              const homeScoreChange = Math.random() > 0.85 ? 1 : 0;
              const awayScoreChange = Math.random() > 0.85 ? 1 : 0;

              return {
                ...match,
                homeScore: match.homeScore + homeScoreChange,
                awayScore: match.awayScore + awayScoreChange,
              };
            }
            return match;
          });

          let errorMsg = 'Using simulated data';
          if (err instanceof Error) {
            const message = err.message;
            if (message.includes('not reachable') || message.includes('Failed to fetch') || message.includes('Network error')) {
              errorMsg = 'Football Highlights API not reachable - verify FOOTBALL_HIGHLIGHTS_API_KEY in Netlify';
            } else if (message.includes('not configured') || message.includes('FOOTBALL_HIGHLIGHTS_API_KEY')) {
              errorMsg = 'API key not configured - set FOOTBALL_HIGHLIGHTS_API_KEY in Netlify environment variables';
            } else if (message.includes('invalid JSON')) {
              errorMsg = 'API error - verify FOOTBALL_HIGHLIGHTS_API_KEY is valid';
            } else if (message.includes('No matches available')) {
              errorMsg = 'No matches found for today (showing simulated data)';
            } else {
              errorMsg = message.length > 150 ? `${message.slice(0, 150)}...` : message;
            }
          }

          setState((prev) => ({
            ...prev,
            matches: simulatedMatches,
            source: 'simulated',
            loading: false,
            error: errorMsg,
            lastUpdated: new Date(),
          }));

          console.error('Score fetch error:', err);
        }
      }
    };

    // Fetch immediately
    fetchScores();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchScores, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [initialMatches]);

  return state;
}

function mapHighlightsStatus(status: string): 'live' | 'finished' | 'scheduled' | 'halftime' {
  const normalized = status.toUpperCase();
  const statusMap: Record<string, 'live' | 'finished' | 'scheduled' | 'halftime'> = {
    NS: 'scheduled',
    TBD: 'scheduled',
    '1H': 'live',
    '2H': 'live',
    HT: 'halftime',
    FT: 'finished',
  };
  return statusMap[normalized] || 'scheduled';
}
