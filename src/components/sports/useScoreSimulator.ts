import { useEffect, useState } from 'react';
import { Match } from '@/data/sportsData';
import { getSupabaseClientConfig } from '@/lib/supabaseConfig';

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
        const apiUrl = '/.netlify/functions/live-scores';

        console.log('Fetching from Netlify Function:', apiUrl);

        let response;
        try {
          response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log('Netlify Function response status:', response.status);
        } catch (fetchErr) {
          console.error('Network error calling Netlify Function:', fetchErr);
          throw new Error(
            `Netlify Function not reachable. Make sure it is deployed and FOOTBALL_API_KEY is set in Netlify environment variables.`
          );
        }

        // Always read response as text first to diagnose issues
        let responseText: string;
        try {
          responseText = await response.text();
        } catch (textErr) {
          throw new Error('Failed to read Edge Function response');
        }

        // Try to parse as JSON
        let data: any;
        try {
          data = JSON.parse(responseText);
        } catch (parseErr) {
          // Not JSON, return error with preview of what we got
          throw new Error(
            `Edge Function returned invalid JSON (${response.status}). ` +
            `Response: "${responseText.slice(0, 100)}...". ` +
            `This usually means the function is not deployed or has a configuration error.`
          );
        }

        if (response.ok && isMounted) {
          if (data && data.matches && Array.isArray(data.matches) && data.matches.length > 0) {
            setState((prev) => ({
              ...prev,
              matches: data.matches,
              source: data.source || 'api',
              loading: false,
              error: null,
              lastUpdated: new Date(),
            }));
          } else {
            throw new Error(data?.message || 'No matches available from API');
          }
        } else {
          // Error response
          const errorMsg = data?.message || data?.error || `API returned ${response.status}`;
          throw new Error(errorMsg);
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
              errorMsg = 'Netlify Function not deployed - ensure it is deployed in your project';
            } else if (message.includes('not configured') || message.includes('FOOTBALL_API_KEY')) {
              errorMsg = 'API key not configured - set FOOTBALL_API_KEY in Netlify environment variables';
            } else if (message.includes('invalid JSON')) {
              errorMsg = 'Function error - verify configuration and FOOTBALL_API_KEY';
            } else if (message.includes('No matches available')) {
              errorMsg = 'No matches today from API (showing simulated data)';
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
