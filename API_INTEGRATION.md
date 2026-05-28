# Sports Highlights API Integration

This project integrates with the **Sport Highlights API** (via RapidAPI) to provide real-time sports data including matches, teams, leagues, and video highlights.

## API Setup

### Step 1: Get API Key

1. Visit [RapidAPI Sport Highlights API](https://rapidapi.com/api-sports-api-sports-default/api/sport-highlights-api)
2. Sign up or log in to RapidAPI
3. Click "Subscribe" (Free tier: 100 requests/day)
4. Copy your **API Key** from the dashboard

### Step 2: Configure Environment Variable

Create or update `.env.local` in the project root:

```bash
VITE_HIGHLIGHTLY_API_KEY=your-api-key-here
```

Replace `your-api-key-here` with your actual RapidAPI key.

**Note:** This key is for development only. Never commit `.env.local` to version control.

## Features

### API Client (`src/api/highlightly-client.ts`)

Complete TypeScript client with support for multiple sports:

- **Football** - Matches, leagues, teams, players, standings, highlights
- **Basketball** - Matches, leagues, highlights
- **Hockey** - Matches, leagues, highlights
- **Rugby** - Matches, leagues, highlights
- **American Football** - Matches, highlights
- **Handball** - Matches, leagues, highlights

### React Hooks (`src/hooks/useSportsData.ts`)

Generic hook for data fetching with loading/error states:

```typescript
const { data, loading, error } = useSportsData(() => 
  football.getMatches({ status: 'live' })
);
```

### Components

#### Highlights Component
- Fetches video highlights for matches
- Displays thumbnail previews with playback duration
- Links to video URLs
- Error handling with fallback UI

```typescript
import Highlights from '@/components/sports/Highlights';

<Highlights />
```

#### Teams Component
- Displays teams with logos
- Filterable by league/country
- Team count configurable
- Responsive grid layout

```typescript
import TeamsGrid from '@/components/sports/TeamsGrid';

<TeamsGrid league="Premier League" limit={12} />
```

#### Leagues Component
- Lists available leagues
- Shows season information
- League logos with fallback icons
- Click-ready for navigation

```typescript
import LeaguesList from '@/components/sports/LeaguesList';

<LeaguesList country="England" season={2024} />
```

## API Methods

### Football

```typescript
import { football } from '@/api/highlightly-client';

// Get matches
const matches = await football.getMatches({ 
  status: 'live', 
  league: 'Premier League',
  limit: 10 
});

// Get leagues
const leagues = await football.getLeagues({ country: 'England' });

// Get teams
const teams = await football.getTeams({ league: 'Premier League' });

// Get highlights
const highlights = await football.getHighlights({ limit: 20 });

// Get standings
const standings = await football.getStandings({ league: 'Premier League' });

// Get players
const players = await football.getPlayers({ team: 'Manchester United' });
```

### Basketball, Hockey, Rugby, etc.

Similar structure with sport-specific endpoints:

```typescript
import { basketball, hockey, rugby, americanFootball, handball } from '@/api/highlightly-client';

const nbaMatches = await basketball.getMatches({ league: 'NBA' });
const nhlMatches = await hockey.getMatches({ league: 'NHL' });
```

## Error Handling

API calls include built-in error handling:

- Missing API key: `VITE_HIGHLIGHTLY_API_KEY environment variable is not set`
- Network errors: Caught and displayed to user
- Invalid responses: Type-safe with fallback to empty arrays

Components show user-friendly error messages with AlertCircle icon.

## Integration in AppLayout

The main app layout now:

1. **Attempts API fetch** on mount for live matches
2. **Falls back to mock data** if API fails
3. **Shows data source** in status bar (API vs Simulated)
4. **Includes new sections:**
   - Video Highlights carousel
   - Top Teams grid
   - Football Leagues list

## Rate Limiting

The free RapidAPI tier includes:
- **100 requests/day** (approximately 14 requests/hour)
- **10 requests/month** (legacy limit)

Optimize with:
- Caching responses in React state
- Using pagination (`limit` parameter)
- Requesting only needed data fields

## Troubleshooting

### "API error - verify VITE_HIGHLIGHTLY_API_KEY is valid"

1. Check `.env.local` has correct key
2. Restart dev server: `npm run dev`
3. Verify key on RapidAPI dashboard
4. Check daily request quota hasn't been exceeded

### Highlights return empty

- Not all matches have video highlights available
- Try filtering by specific league/date
- Check RapidAPI quota remaining

### Slow API responses

- RapidAPI may rate-limit on free tier
- Add client-side caching
- Request fewer items with `limit` parameter

## Next Steps

1. **Authentication:** Add user login with team favorites
2. **Caching:** Store API responses locally (localStorage/IndexedDB)
3. **Polling:** Real-time updates with interval-based refetching
4. **WebSockets:** Stream live score updates
5. **Database:** Persist user preferences (Supabase/Neon recommended)

## Resources

- [Sport Highlights API Docs](https://rapidapi.com/api-sports-api-sports-default/api/sport-highlights-api)
- [OpenAPI Specification](./openapi%20(2).json)
- [RapidAPI Dashboard](https://dashboard.rapidapi.com)
- [Highlightly Official](https://www.highlightly.net)
