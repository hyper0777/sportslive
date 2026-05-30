import { useMemo, useState, useEffect } from 'react';
import { AlertCircle, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  liveMatches,
  standings,
  newsArticles,
  topPlayers,
} from '@/data/sportsData';
import type { Match } from '@/data/sportsData';
import Header from './sports/Header';
import HeroSection from './sports/HeroSection';
import LiveScores from './sports/LiveScores';
import UpcomingMatches from './sports/UpcomingMatches';
import TopScorers from './sports/TopScorers';
import Standings from './sports/Standings';
import NewsFeed from './sports/NewsFeed';
import StatsBar from './sports/StatsBar';
import QuickLinks from './sports/QuickLinks';
import Footer from './sports/Footer';
import BackToTop from './sports/BackToTop';
import Highlights from './sports/Highlights';
import TeamsGrid from './sports/TeamsGrid';
import LeaguesList from './sports/LeaguesList';
import { useScoreSimulator } from './sports/useScoreSimulator';
import BettingInsights from './sports/BettingInsights';

export default function AppLayout() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [apiMatches, setApiMatches] = useState<Match[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setApiMatches(liveMatches);
    setApiLoading(false);
  }, []);

  const scoreState = useScoreSimulator(liveMatches);

  const sportFilteredMatches = selectedSport === 'all'
    ? scoreState.matches
    : scoreState.matches.filter((m) => {
        switch (selectedSport) {
          case 'football':
            return ['NFL'].includes(m.league);
          case 'basketball':
            return ['NBA'].includes(m.league);
          case 'soccer':
            return ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'].includes(m.league);
          case 'baseball':
            return ['MLB'].includes(m.league);
          case 'tennis':
            return ['ATP', 'WTA'].includes(m.league);
          default:
            return true;
        }
      });

  const leagues = useMemo(
    () => ['all', ...Array.from(new Set(sportFilteredMatches.map((m) => m.league))).sort()],
    [sportFilteredMatches],
  );

  const filteredMatches = selectedLeague === 'all'
    ? sportFilteredMatches
    : sportFilteredMatches.filter((m) => m.league === selectedLeague);

  const featuredLive = filteredMatches.find((m) => m.status === 'live') || filteredMatches[0];

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <Header selectedSport={selectedSport} onSportChange={setSelectedSport} />

      <div className="sticky top-16 z-40 bg-gray-900/95 border-b border-gray-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <span className={`inline-block w-2 h-2 rounded-full ${apiMatches.length > 0 ? 'bg-green-500' : scoreState.source === 'edge-function' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
            <span>Data from: {apiMatches.length > 0 && 'Highlightly API'}{apiMatches.length === 0 && scoreState.source === 'edge-function' && 'Edge Function'}{apiMatches.length === 0 && scoreState.source === 'simulated' && 'Simulated'}</span>
            {scoreState.lastUpdated && <span className="text-gray-500">• Updated: {scoreState.lastUpdated.toLocaleTimeString()}</span>}
            {apiLoading && <span className="text-orange-400 animate-pulse">• Loading API...</span>}
            {scoreState.loading && <span className="text-orange-400 animate-pulse">• Updating...</span>}
          </div>

          {(apiError || scoreState.error) && (
            <div className="flex items-center gap-1 text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span>{apiError ? `API: ${apiError}` : scoreState.error}</span>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <aside className="bg-gray-900 rounded-xl border border-gray-800 p-4 h-fit">
            <h2 className="text-sm uppercase tracking-wide text-gray-400 font-semibold mb-3">Leagues</h2>
            <div className="space-y-2">
              {leagues.map((league) => (
                <button
                  key={league}
                  onClick={() => setSelectedLeague(league)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedLeague === league ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600'}`}
                >
                  {league === 'all' ? 'All Leagues' : league}
                </button>
              ))}
            </div>
          </aside>

          <section className="lg:col-span-3 bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Live Stream</h2>
              {featuredLive && (
                <button className="text-sm text-orange-400 hover:text-orange-300" onClick={() => navigate(`/match/${featuredLive.id}`)}>
                  Open match detail →
                </button>
              )}
            </div>
            <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex flex-col items-center justify-center">
              <PlayCircle className="h-16 w-16 text-orange-400 mb-3" />
              <p className="text-lg font-semibold">Video Player Placeholder</p>
              <p className="text-sm text-gray-400">{featuredLive ? `${featuredLive.homeTeam} vs ${featuredLive.awayTeam}` : 'Select a live match to start streaming.'}</p>
            </div>
          </section>
        </div>

        <HeroSection matches={filteredMatches} onWatchClick={(matchId) => navigate(`/match/${matchId}`)} />
        <StatsBar />
        <QuickLinks />

        <section className="mb-12">
          <LiveScores matches={filteredMatches} onMatchClick={(matchId) => navigate(`/match/${matchId}`)} />
        </section>

        <section className="mb-12">
          <BettingInsights matches={filteredMatches} onOpenMatch={(matchId) => navigate(`/match/${matchId}`)} />
        </section>

        <Highlights />

        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Top Teams</h2>
            <TeamsGrid limit={12} />
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Football Leagues</h2>
            <LeaguesList />
          </div>
        </section>

        <section className="mb-12">
          <UpcomingMatches matches={filteredMatches} onMatchClick={(matchId) => navigate(`/match/${matchId}`)} />
        </section>

        <section className="mb-12">
          <Standings standings={standings} />
        </section>

        <section className="mb-12">
          <TopScorers players={topPlayers} />
        </section>

        <section className="mb-12">
          <NewsFeed articles={newsArticles} />
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
