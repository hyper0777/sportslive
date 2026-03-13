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

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const responseText = await response.text();
          throw new Error(
            `Edge Function returned non-JSON (${response.status}): ${responseText.slice(0, 150)}. ` +
            `This usually means the function is not properly deployed or configured.`
          );
        }

        let data;
        try {
          data = await response.json();
        } catch (parseErr) {
          throw new Error('Failed to parse Edge Function response as JSON');
        }

        if (response.ok && isMounted) {
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
            throw new Error(data.message || 'No matches available');
          }
        } else {
          throw new Error(data.message || data.error || `API returned ${response.status}`);
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
            if (message.includes('not configured') || message.includes('FOOTBALL_API_KEY')) {
              errorMsg = 'API key not configured - add FOOTBALL_API_KEY to Supabase Edge Function secrets';
            } else if (message.includes('Failed to fetch') || message.includes('network')) {
              errorMsg = 'Edge Function unavailable - check Supabase connection';
            } else if (message.includes('Invalid response')) {
              errorMsg = 'Edge Function returned invalid response - check function deployment and configuration';
            } else if (message.includes('is not defined')) {
              errorMsg = 'Edge Function has configuration error - verify FOOTBALL_API_KEY is set in Supabase secrets';
            } else {
              errorMsg = message;
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
