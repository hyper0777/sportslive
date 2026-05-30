import { useState, useEffect } from 'react';
import { Play, AlertCircle, Loader } from 'lucide-react';

export default function Highlights() {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'football'>('all');

  useEffect(() => {
    setHighlights([
      {
        id: 'h1',
        title: 'Manchester United vs Liverpool - Full Highlights',
        duration: 120,
        thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=225&fit=crop',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'h2',
        title: 'Arsenal vs Chelsea - Match Highlights',
        duration: 95,
        thumbnail: 'https://images.unsplash.com/photo-1552671405-112edc97a5c8?w=400&h=225&fit=crop',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'h3',
        title: 'Manchester City vs Tottenham - Extended Highlights',
        duration: 140,
        thumbnail: 'https://images.unsplash.com/photo-1517747292ec5f4f8b1cfcb6b0bd87e7?w=400&h=225&fit=crop',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'h4',
        title: 'Liverpool vs Everton - Highlights',
        duration: 110,
        thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=225&fit=crop',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'h5',
        title: 'Tottenham vs Brighton - Match Highlights',
        duration: 105,
        thumbnail: 'https://images.unsplash.com/photo-1552671405-112edc97a5c8?w=400&h=225&fit=crop',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'h6',
        title: 'Aston Villa vs Wolverhampton - Highlights',
        duration: 115,
        thumbnail: 'https://images.unsplash.com/photo-1517747292ec5f4f8b1cfcb6b0bd87e7?w=400&h=225&fit=crop',
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Video Highlights</h2>
        <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 text-orange-400 animate-spin" />
            <p className="text-gray-400">Loading highlights...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Video Highlights</h2>
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-medium">Failed to load highlights</p>
            <p className="text-red-200/70 text-sm">{error}</p>
            <p className="text-red-200/60 text-xs mt-1">Make sure VITE_HIGHLIGHTLY_API_KEY is configured</p>
          </div>
        </div>
      </section>
    );
  }

  if (highlights.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Video Highlights</h2>
        <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-400">No highlights available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Video Highlights</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('football')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'football'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Football
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((highlight) => (
          <a
            key={highlight.id}
            href={highlight.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 hover:border-orange-500/50 transition cursor-pointer"
          >
            {highlight.thumbnail ? (
              <img
                src={highlight.thumbnail}
                alt={highlight.title}
                className="w-full aspect-video object-cover group-hover:brightness-75 transition"
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-600" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Play className="h-12 w-12 text-orange-400 fill-orange-400" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
              <h3 className="text-sm font-semibold text-white line-clamp-2">
                {highlight.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {highlight.duration
                  ? `${Math.round(highlight.duration / 60)} min`
                  : 'Video highlight'}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
