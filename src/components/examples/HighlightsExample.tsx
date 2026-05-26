import { useEffect, useState } from 'react';
import { getMatchesByDate, getMatchesByLeague, type FootballHighlightsResponse } from '@/api/football-highlights';

/**
 * Example component showing how to use the Football Highlights API
 * All API calls are securely routed through Netlify Functions
 * The RapidAPI key is never exposed to the frontend
 */
export function HighlightsExample() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example 1: Fetch matches by date
  const loadMatchesByDate = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await getMatchesByDate(today);
      setMatches(result.matches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Fetch matches by league
  const loadLeagueMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMatchesByLeague('97798', '2023'); // Superettan league
      setMatches(result.matches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch league matches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Football Highlights API Examples</h3>
        <p className="text-sm text-gray-600">
          All requests are securely proxied through Netlify Functions. API keys never exposed to frontend.
        </p>
      </div>

      <div className="space-x-2">
        <button
          onClick={loadMatchesByDate}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Load Today's Matches
        </button>
        <button
          onClick={loadLeagueMatches}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Load Superettan League
        </button>
      </div>

      {loading && <p className="text-amber-600">Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {matches.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Matches Found: {matches.length}</h4>
          <ul className="space-y-1 text-sm">
            {matches.slice(0, 5).map((match, idx) => (
              <li key={idx} className="p-2 bg-gray-100 rounded">
                {match.homeTeamName} vs {match.awayTeamName} - {match.date}
              </li>
            ))}
            {matches.length > 5 && <li className="text-gray-500">... and {matches.length - 5} more</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
