import { useState, useEffect } from 'react';
import { AlertCircle, Loader, Trophy } from 'lucide-react';

interface LeaguesListProps {
  country?: string;
  season?: number;
}

export default function LeaguesList({
  country,
  season,
}: LeaguesListProps) {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mockLeagues = [
      { id: 'l1', name: 'Premier League', country: 'England', logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100' },
      { id: 'l2', name: 'La Liga', country: 'Spain', logo: 'https://images.unsplash.com/photo-1552671405-112edc97a5c8?w=100' },
      { id: 'l3', name: 'Serie A', country: 'Italy', logo: 'https://images.unsplash.com/photo-1517747292ec5f4f8b1cfcb6b0bd87e7?w=100' },
      { id: 'l4', name: 'Bundesliga', country: 'Germany', logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100' },
      { id: 'l5', name: 'Ligue 1', country: 'France', logo: 'https://images.unsplash.com/photo-1552671405-112edc97a5c8?w=100' },
      { id: 'l6', name: 'Eredivisie', country: 'Netherlands', logo: 'https://images.unsplash.com/photo-1517747292ec5f4f8b1cfcb6b0bd87e7?w=100' },
    ];
    setLeagues(mockLeagues);
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
