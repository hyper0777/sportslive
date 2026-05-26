import { useEffect, useState } from 'react';
import { Match } from '@/data/sportsData';
import { getTodaysMatches } from '@/api/highlightly-matches';

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
        console.log('Fetching matches from Highlightly API');

        const data = await getTodaysMatches();

        console.log('Highlightly API response received:', data);

        if (data && data.matches && Array.isArray(data.matches) && data.matches.length > 0) {
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              matches: data.matches,
              source: 'api',
              loading: false,
              error: null,
              lastUpdated: new Date(),
            }));
          }
        } else {
          throw new Error('No matches available from API');
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
              errorMsg = 'Highlightly API not reachable - verify HIGHLIGHTLY_API_KEY in Netlify';
            } else if (message.includes('not configured') || message.includes('HIGHLIGHTLY_API_KEY')) {
              errorMsg = 'API key not configured - set HIGHLIGHTLY_API_KEY in Netlify environment variables';
            } else if (message.includes('invalid JSON')) {
              errorMsg = 'API error - verify HIGHLIGHTLY_API_KEY is valid';
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
