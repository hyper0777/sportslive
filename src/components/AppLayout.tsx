import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  liveMatches,
  standings,
  newsArticles,
  topPlayers,
} from '@/data/sportsData';
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
import FeaturedMatch from './sports/FeaturedMatch';
import { useScoreSimulator } from './sports/useScoreSimulator';

export default function AppLayout() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  // Use the score simulator hook
  const scoreState = useScoreSimulator(liveMatches);

  // Filter matches by sport
  const filteredMatches = selectedSport === 'all'
    ? scoreState.matches
    : scoreState.matches.filter((m) => {
        switch (selectedSport) {
          case 'football':
            return ['NFL'].includes(m.league);
          case 'basketball':
            return ['NBA'].includes(m.league);
          case 'soccer':
            return [
              'Premier League',
              'La Liga',
              'Serie A',
              'Bundesliga',
              'Ligue 1',
            ].includes(m.league);
          case 'baseball':
            return ['MLB'].includes(m.league);
          case 'tennis':
            return ['ATP', 'WTA'].includes(m.league);
          default:
            return true;
        }
      });

  const selectedMatchData =
    selectedMatch && filteredMatches.find((m) => m.id === selectedMatch);

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* Header */}
      <Header
        selectedSport={selectedSport}
        onSportChange={setSelectedSport}
      />

      {/* Data Source Indicator */}
      <div className="sticky top-16 z-40 bg-gray-900/95 border-b border-gray-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <span className={`inline-block w-2 h-2 rounded-full ${
              scoreState.source === 'api'
                ? 'bg-green-500'
                : scoreState.source === 'edge-function'
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
            }`} />
            <span>
              Data from:
              {scoreState.source === 'api' && ' Live API'}
              {scoreState.source === 'edge-function' && ' Edge Function'}
              {scoreState.source === 'simulated' && ' Simulated'}
            </span>
            {scoreState.lastUpdated && (
              <span className="text-gray-500">
                • Updated: {scoreState.lastUpdated.toLocaleTimeString()}
              </span>
            )}
            {scoreState.loading && (
              <span className="text-orange-400 animate-pulse">• Updating...</span>
            )}
          </div>

          {scoreState.error && (
            <div className="flex items-center gap-1 text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span>{scoreState.error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <HeroSection
          matches={filteredMatches}
          onWatchClick={(matchId) => {
            setSelectedMatch(matchId);
            setIsMatchModalOpen(true);
          }}
        />

        {/* Stats Bar */}
        <StatsBar />

        {/* Quick Links */}
        <QuickLinks />

        {/* Live Scores Section */}
        <section className="mb-12">
          <LiveScores
            matches={filteredMatches}
            onMatchClick={(matchId) => {
              setSelectedMatch(matchId);
              setIsMatchModalOpen(true);
            }}
          />
        </section>

        {/* Featured Match Modal */}
        {selectedMatchData && (
          <FeaturedMatch
            match={selectedMatchData}
            isOpen={isMatchModalOpen}
            onClose={() => setIsMatchModalOpen(false)}
          />
        )}

        {/* Upcoming Matches Section */}
        <section className="mb-12">
          <UpcomingMatches
            matches={filteredMatches}
            onMatchClick={(matchId) => {
              setSelectedMatch(matchId);
              setIsMatchModalOpen(true);
            }}
          />
        </section>

        {/* Standings Section */}
        <section className="mb-12">
          <Standings standings={standings} />
        </section>

        {/* Top Scorers Section */}
        <section className="mb-12">
          <TopScorers players={topPlayers} />
        </section>

        {/* News Feed Section */}
        <section className="mb-12">
          <NewsFeed articles={newsArticles} />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}
