/**
 * Re-export from football-highlights for backward compatibility
 * Use src/api/football-highlights instead
 */
export {
  type HighlightlyMatch,
  type MatchesResponse,
  type MatchEvent,
  type MatchEventsResponse,
  type StandingEntry,
  type StandingsResponse,
  getTodaysMatches,
  getMatchEvents,
  getStandings,
} from './football-highlights';

export { type MatchEvent as HighlightlyEvent };
