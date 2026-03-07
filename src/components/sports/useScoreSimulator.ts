import { useEffect, useState } from 'react';
import { Match } from '@/data/sportsData';

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
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase configuration missing');
        }

        const apiUrl = `${supabaseUrl}/functions/v1/live-scores`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok && isMounted) {
          const data = await response.json();

          if (data.matches && data.matches.length > 0) {
            setState((prev) => ({
              ...prev,
              matches: data.matches,
              source: data.source || 'api',
              loading: false,
              error: null,
              lastUpdated: new Date(),
            }));
          } else {
            throw new Error('No matches available');
          }
        } else {
          const errorText = await response.text();
          throw new Error(`API returned ${response.status}: ${errorText}`);
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

          setState((prev) => ({
            ...prev,
            matches: simulatedMatches,
            source: 'simulated',
            loading: false,
            error:
              err instanceof Error
                ? `Using simulated data: ${err.message}`
                : 'Using simulated data',
            lastUpdated: new Date(),
          }));
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
