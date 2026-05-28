# Usage Examples - Sports API Client

## Basic Setup

```typescript
import { football, basketball, hockey } from '@/api/highlightly-client';
```

## Football API Examples

### Get Live Matches
```typescript
const matches = await football.getMatches({
  status: 'live',
  limit: 10
});
// Returns array of matches with current scores
```

### Get Matches by League
```typescript
const premierLeague = await football.getMatches({
  league: 'Premier League',
  season: 2024,
  limit: 20
});
```

### Get All Countries
```typescript
const countries = await football.getCountries();
// [{ id, name, code, flag }, ...]

// Or search specific country
const france = await football.getCountries({ name: 'France' });
```

### Get Leagues
```typescript
const leagues = await football.getLeagues({
  country: 'England',
  season: 2024
});
// Returns paginated league data
```

### Get Teams
```typescript
const teams = await football.getTeams({
  league: 'Premier League',
  limit: 20
});

// Or by country
const englishTeams = await football.getTeams({
  country: 'England'
});
```

### Get Team Details
```typescript
const team = await football.getTeam('33'); // Manchester United ID
// Returns: { id, name, logo, country, ... }
```

### Get Video Highlights
```typescript
const highlights = await football.getHighlights({
  league: 'Premier League',
  limit: 12
});
// Returns array of videos with URLs and thumbnails
```

### Get Standings/Table
```typescript
const standings = await football.getStandings({
  league: 'Premier League',
  season: 2024
});
// Returns league table with rankings, points, goals, etc.
```

### Get Players
```typescript
const players = await football.getPlayers({
  team: '33',
  limit: 25
});
// Returns team roster
```

### Get Player Details
```typescript
const player = await football.getPlayer('1234');
// Returns player info, stats, career data
```

### Get Match Lineups
```typescript
const lineups = await football.getLineups('matchId123');
// Returns starting XI, formations, substitutes
```

### Get Match Statistics
```typescript
const stats = await football.getStatistics('matchId123');
// Returns possession, shots, fouls, cards, etc.
```

### Get Live Match Events
```typescript
const events = await football.getLiveEvents('matchId123');
// Returns play-by-play: goals, cards, subs, etc.
```

### Get Betting Odds
```typescript
const odds = await football.getOdds({
  match: 'matchId123',
  limit: 10
});
// Returns odds from different bookmakers
```

## React Component Usage

### Using with useSportsData Hook

```typescript
import { useSportsData } from '@/hooks/useSportsData';
import { football } from '@/api/highlightly-client';

export function LiveMatches() {
  const { data: matches, loading, error } = useSportsData(
    () => football.getMatches({ status: 'live' })
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {matches?.map(match => (
        <div key={match.id}>
          {match.homeTeam.name} vs {match.awayTeam.name}
        </div>
      ))}
    </div>
  );
}
```

### Direct Component Usage

```typescript
import { football } from '@/api/highlightly-client';

export function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await football.getTeams({ 
          league: 'Premier League',
          limit: 20 
        });
        setTeams(data.data);
      } catch (err) {
        console.error('Failed to load teams:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeams();
  }, []);

  return (
    <div>
      {teams.map(team => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
```

## Basketball Examples

```typescript
import { basketball } from '@/api/highlightly-client';

// Get NBA matches
const nbaMatches = await basketball.getMatches({
  league: 'NBA',
  status: 'live'
});

// Get leagues
const leagues = await basketball.getLeagues({
  season: 2024
});

// Get highlights
const highlights = await basketball.getHighlights({
  league: 'NBA',
  limit: 10
});
```

## Hockey Examples

```typescript
import { hockey } from '@/api/highlightly-client';

const nhlMatches = await hockey.getMatches({
  league: 'NHL',
  status: 'live'
});

const leagues = await hockey.getLeagues({ season: 2024 });
```

## Rugby Examples

```typescript
import { rugby } from '@/api/highlightly-client';

const matches = await rugby.getMatches({
  league: 'Super League',
  status: 'scheduled'
});
```

## American Football Examples

```typescript
import { americanFootball } from '@/api/highlightly-client';

const nflMatches = await americanFootball.getMatches({
  league: 'NFL',
  season: 2024
});

const highlights = await americanFootball.getHighlights({
  league: 'NFL'
});
```

## Handball Examples

```typescript
import { handball } from '@/api/highlightly-client';

const matches = await handball.getMatches({
  league: 'Bundesliga',
  status: 'live'
});
```

## Error Handling Examples

```typescript
import { football } from '@/api/highlightly-client';

try {
  const matches = await football.getMatches({ status: 'live' });
  console.log('Got matches:', matches.data);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('environment variable')) {
      console.error('API key not configured');
    } else if (error.message.includes('404')) {
      console.error('Resource not found');
    } else {
      console.error('API Error:', error.message);
    }
  }
}
```

## Pagination Examples

```typescript
// Get first page of teams
const page1 = await football.getTeams({
  league: 'Premier League',
  limit: 10,
  page: 1
});

// Get second page
const page2 = await football.getTeams({
  league: 'Premier League',
  limit: 10,
  page: 2
});
```

## Common Parameters

Most endpoints support these parameters:

```typescript
{
  limit?: number;           // Items per request (default: varies)
  page?: number;            // Page number (for pagination)
  season?: number;          // e.g., 2024
  status?: 'live' | 'finished' | 'scheduled';
  league?: string;          // League name or ID
  country?: string;         // Country name or code
  team?: string;            // Team name or ID
}
```

## Response Structure

Most endpoints return:

```typescript
{
  data: Array<T>;           // Array of items
  pagination?: {
    current: number;
    total: number;
    count: number;
    limit: number;
  }
}
```

Or for single items:

```typescript
{
  id: string;
  name: string;
  // ... other fields
}
```

## Tips

1. **Check Required Parameters** - Some endpoints require specific parameters
2. **Limit Results** - Use `limit` parameter to reduce API calls
3. **Cache Results** - Store in React state or localStorage
4. **Handle Errors** - Always include try/catch
5. **Check Rate Limits** - Free tier is 100 requests/day
6. **Use Pagination** - Split large result sets across requests
7. **Monitor Console** - Check browser console for specific error messages

## TypeScript Types

All responses are fully typed:

```typescript
import type { Match, Team, League, Player, Highlight, Standings } from '@/api/highlightly-client';

const match: Match = await football.getMatch('123');
const team: Team = await football.getTeam('33');
const standings: Standings = await football.getStandings({ league: 'Premier League' });
```

---

For more information, see API_INTEGRATION.md and SETUP_GUIDE.md
