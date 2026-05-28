import { useState, useEffect } from 'react';
import { AlertCircle, Loader, Trophy } from 'lucide-react';
import { football } from '@/api/highlightly-client';
import type { League } from '@/api/highlightly-client';

interface LeaguesListProps {
  country?: string;
  season?: number;
}

export default function LeaguesList({
  country,
  season,
}: LeaguesListProps) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeagues() {
      try {
        setLoading(true);
        setError(null);
        const result = await football.getLeagues({
          country,
          season,
          limit: 20,
        });
        setLeagues(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load leagues',
        );
        console.error('Error fetching leagues:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeagues();
  }, [country, season]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-900 rounded-xl border border-gray-800">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 text-orange-400 animate-spin" />
          <p className="text-gray-400">Loading leagues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-red-300 font-medium">Failed to load leagues</p>
          <p className="text-red-200/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (leagues.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-900 rounded-xl border border-gray-800">
        <p className="text-gray-400">No leagues found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leagues.map((league) => (
        <button
          key={league.id}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-orange-500/50 hover:bg-gray-800/50 transition text-left"
        >
          {league.logo ? (
            <img
              src={league.logo}
              alt={league.name}
              className="h-8 w-8 object-contain flex-shrink-0"
            />
          ) : (
            <Trophy className="h-5 w-5 text-orange-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {league.name}
            </h3>
            {league.season && (
              <p className="text-xs text-gray-400">Season {league.season}</p>
            )}
          </div>
          <span className="text-xs text-gray-500">→</span>
        </button>
      ))}
    </div>
  );
}
