import { useState, useEffect } from 'react';
import { AlertCircle, Loader } from 'lucide-react';

interface TeamsGridProps {
  league?: string;
  country?: string;
  limit?: number;
}

export default function TeamsGrid({
  league,
  country,
  limit = 8,
}: TeamsGridProps) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mockTeams = [
      { id: 't1', name: 'Manchester United', logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100' },
      { id: 't2', name: 'Liverpool', logo: 'https://images.unsplash.com/photo-1552671405-112edc97a5c8?w=100' },
      { id: 't3', name: 'Manchester City', logo: 'https://images.unsplash.com/photo-1517747292ec5f4f8b1cfcb6b0bd87e7?w=100' },
      { id: 't4', name: 'Arsenal', logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100' },
      { id: 't5', name: 'Chelsea', logo: 'https://images.unsplash.com/photo-1552671405-112edc97a5c8?w=100' },
      { id: 't6', name: 'Tottenham', logo: 'https://images.unsplash.com/photo-1517747292ec5f4f8b1cfcb6b0bd87e7?w=100' },
      { id: 't7', name: 'Aston Villa', logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100' },
      { id: 't8', name: 'Brighton', logo: 'https://images.unsplash.com/photo-1552671405-112edc97a5c8?w=100' },
    ];
    setTeams(mockTeams.slice(0, limit));
  }, [limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 text-orange-400 animate-spin" />
          <p className="text-gray-400">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-red-300 font-medium">Failed to load teams</p>
          <p className="text-red-200/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-900 rounded-xl border border-gray-800">
        <p className="text-gray-400">No teams found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {teams.map((team) => (
        <button
          key={team.id}
          className="group relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 hover:border-orange-500/50 transition p-4 text-left"
        >
          <div className="flex flex-col items-center gap-3">
            {team.logo ? (
              <img
                src={team.logo}
                alt={team.name}
                className="h-12 w-12 object-contain group-hover:scale-110 transition"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                {team.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="text-center">
              <h3 className="text-sm font-semibold text-white line-clamp-2">
                {team.name}
              </h3>
              {team.country && (
                <p className="text-xs text-gray-400 mt-1">{team.country}</p>
              )}
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
        </button>
      ))}
    </div>
  );
}
