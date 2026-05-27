# Sports App API Integration

## Overview
All API integrations use **Highlightly Sports API** exclusively. API keys are stored securely in Netlify environment variables and never exposed to the frontend.

## Environment Variables (Netlify)
```
HIGHLIGHTLY_API_KEY=<your-api-key>
HIGHLIGHTLY_BASE_URL=https://sports.highlightly.net
```

## Netlify Functions

### 1. `highlightly-matches`
**Endpoint:** `/.netlify/functions/highlightly-matches`

Fetches today's football matches.

**Usage:**
```typescript
import { getTodaysMatches } from '@/api/football-highlights';

const matches = await getTodaysMatches();
console.log(matches.matches); // Array of HighlightlyMatch
```

**Response:**
```typescript
{
  matches: HighlightlyMatch[],
  source: 'api' | 'error',
  provider: string,
  timestamp: string,
  error?: string
}
```

---

### 2. `highlightly-events`
**Endpoint:** `/.netlify/functions/highlightly-events?id={matchId}`

Fetches live events for a specific match (goals, cards, substitutions, corners, fouls).

**Usage:**
```typescript
import { getMatchEvents } from '@/api/football-highlights';

const events = await getMatchEvents('match-123');
console.log(events.events); // Array of MatchEvent
```

**Response:**
```typescript
{
  events: MatchEvent[],
  matchId: string,
  source: 'api' | 'error',
  timestamp: string,
  error?: string
}
```

**Event Types:**
- `goal` - Goal scored
- `card` - Yellow/red card
- `substitution` - Player substitution
- `corner` - Corner kick
- `foul` - Foul/tackle
- `other` - Other events

---

### 3. `highlightly-standings`
**Endpoint:** `/.netlify/functions/highlightly-standings?leagueId={id}&season={year}`

Fetches league standings for a specific season.

**Usage:**
```typescript
import { getStandings } from '@/api/football-highlights';

const standings = await getStandings(104, 2025); // Premier League, 2025
console.log(standings.standings); // Array of StandingEntry
```

**Response:**
```typescript
{
  standings: StandingEntry[],
  league: { id: number, name: string },
  season: number,
  source: 'api' | 'error',
  timestamp: string,
  error?: string
}
```

---

## Frontend API Client

All functions are exported from `src/api/football-highlights.ts`:

```typescript
// Import functions
import {
  getTodaysMatches,
  getMatchEvents,
  getStandings,
} from '@/api/football-highlights';

// Import types
import type {
  HighlightlyMatch,
  MatchEvent,
  StandingEntry,
} from '@/api/football-highlights';
```

## Security

✅ API keys stored securely in Netlify environment variables  
✅ All sensitive data handled server-side  
✅ Frontend has no access to credentials  
✅ CORS enabled for safe cross-origin requests  
✅ All endpoints validate input and handle errors gracefully

## Error Handling

All endpoints return a consistent error structure:
```typescript
{
  error: string,
  message: string,
  source: 'error',
  timestamp: string
}
```

The frontend can use the `error` field to display user-friendly messages.

## Testing

To test the API:

1. Verify environment variables are set in Netlify
2. Fetch matches:
   ```typescript
   const data = await getTodaysMatches();
   console.log(data);
   ```
3. Check the browser console and Netlify function logs for errors
