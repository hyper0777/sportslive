# Secure API Integration Guide

All external API calls are securely routed through Netlify Functions. **No API keys are exposed to the frontend.**

## Available APIs

### 1. Football Highlights API 🎬
**Endpoint:** `/.netlify/functions/football-highlights`  
**Purpose:** Fetch match data, highlights, team fixtures  
**RapidAPI:** https://rapidapi.com/api-sports/api/football-highlights

#### Netlify Environment Variables Required:
```
FOOTBALL_HIGHLIGHTS_API_KEY=your-rapidapi-key
FOOTBALL_HIGHLIGHTS_API_HOST=football-highlights-api.p.rapidapi.com
```

#### Frontend Usage:
```typescript
import { 
  getMatchesByDate,
  getMatchesByLeague,
  getTeamFixtures,
  fetchFootballHighlights
} from '@/api/football-highlights';

// By date
const matches = await getMatchesByDate('2024-01-15');

// By league
const leagueMatches = await getMatchesByLeague('97798', '2023');

// By teams
const fixtures = await getTeamFixtures('5700782', '1907875');

// Custom query
const custom = await fetchFootballHighlights({
  homeTeamName: 'Arsenal',
  awayTeamName: 'Chelsea',
  countryCode: 'GB',
  season: '2023'
});
```

---

### 2. Football Live Scores API ⚽
**Endpoint:** `/.netlify/functions/live-scores`  
**Purpose:** Real-time match scores and events  
**Providers:** API-Football, RapidAPI, Free-Football-API-Data

#### Netlify Environment Variables Required:
```
FOOTBALL_API_KEY=your-api-key
FOOTBALL_API_PROVIDER=apisports|rapidapi|free-football-api-data
```

#### Frontend Usage:
```typescript
import { fetchFootballResource } from '@/api/free-football';

const liveScores = await fetchFootballResource({
  resource: 'live-scores',
  date: '2024-01-15'
});
```

---

### 3. Sports Data API 🏆
**Endpoint:** `/.netlify/functions/sports-data`  
**Purpose:** Country flags, league data, general sports info  
**RapidAPI:** https://rapidapi.com/api-sports/api/all-sports-api

#### Netlify Environment Variables Required:
```
ALLSPORTS_API_KEY=your-rapidapi-key
ALLSPORTS_API_HOST=allsportsapi2.p.rapidapi.com
```

#### Frontend Usage:
```typescript
import { 
  getCountryFlag,
  getCountryData,
  fetchSportsData
} from '@/api/sports-data';

// Get country flag
const flag = await getCountryFlag('AU');

// Get country data
const data = await getCountryData('AU');

// Custom query
const custom = await fetchSportsData({
  endpoint: 'flag',
  country: 'GB'
});
```

---

## Architecture

```
┌─────────────────────┐
│   Browser/Frontend  │
│  (React Components) │
└──────────┬──────────┘
           │ (HTTP POST/GET)
           │ No sensitive data
           ▼
┌─────────────────────┐
│ Netlify Functions   │ ◄── Environment Variables
│   (Proxies)         │     (API Keys)
└──────────┬──────────┘
           │ (HTTPS)
           │ Includes API key
           ▼
┌─────────────────────┐
│  RapidAPI / Direct  │
│   External APIs     │
└─────────────────────┘
```

## Key Benefits

✅ **Security**
- No API keys in frontend code
- Keys stored only in Netlify environment variables
- Keys never exposed to browser or client

✅ **CORS Handling**
- Netlify Functions handle CORS headers
- No browser CORS issues
- Requests always work across domains

✅ **Rate Limiting Protection**
- All requests proxied through Netlify
- Easier to implement rate limiting on backend
- Can add authentication to functions

✅ **Flexibility**
- Easy to switch API providers
- Change keys without redeploying frontend
- Add caching or transformation logic

## Setup Instructions

### 1. Get API Keys

**Football Highlights:**
- https://rapidapi.com/api-sports/api/football-highlights
- Subscribe and get your key from dashboard

**Football Live Scores:**
- https://www.api-football.com (recommended)
- Or https://rapidapi.com/api-sports/api/api-football

**Sports Data:**
- https://rapidapi.com/api-sports/api/all-sports-api

### 2. Configure Netlify

1. Go to https://app.netlify.com
2. Select your site → **Site Settings** → **Build & Deploy** → **Environment**
3. Add environment variables (non-sensitive values in git, actual keys in Netlify)
4. Redeploy: `netlify deploy --prod`

### 3. Local Development

Create `.env.local` (git-ignored):
```bash
FOOTBALL_HIGHLIGHTS_API_KEY=your-test-key
FOOTBALL_HIGHLIGHTS_API_HOST=football-highlights-api.p.rapidapi.com
FOOTBALL_API_KEY=your-test-key
FOOTBALL_API_PROVIDER=apisports
ALLSPORTS_API_KEY=your-test-key
ALLSPORTS_API_HOST=allsportsapi2.p.rapidapi.com
```

Run with Netlify Functions support:
```bash
netlify dev
```

## Error Handling

All Netlify Functions return consistent error responses:

```typescript
{
  error: "Failed to fetch data",
  message: "Detailed error message",
  matches: [],
  source: "error"
}
```

Frontend code should check for `error` field and fall back to simulated data if needed.

## Security Checklist

- ✅ Never hardcode API keys in source
- ✅ Store all keys in Netlify environment variables
- ✅ Add keys to `.env.example` as placeholders only
- ✅ Add `.env.local` to `.gitignore`
- ✅ Route all external API calls through Netlify Functions
- ✅ Validate query parameters in functions
- ✅ Log requests for debugging (no sensitive data)

## Testing

### Test with cURL
```bash
# Test live-scores function
curl -X GET "https://your-site.netlify.app/.netlify/functions/live-scores"

# Test football-highlights function
curl -X POST "https://your-site.netlify.app/.netlify/functions/football-highlights" \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-01-15"}'
```

### Test Locally
```bash
netlify dev
# Then call http://localhost:8888/.netlify/functions/live-scores
```

## Troubleshooting

**"API key not configured" error:**
- Verify key name is exact: `FOOTBALL_HIGHLIGHTS_API_KEY`
- Check Netlify environment variable settings
- Redeploy after changing variables
- Check `netlify dev` console output

**"Function not reachable" error:**
- Ensure `netlify.toml` exists in project root
- Verify function files in `netlify/functions/`
- Run `netlify deploy --prod`
- Check Netlify function logs

**CORS errors:**
- Netlify Functions automatically handle CORS
- Ensure requests go to `/.netlify/functions/` paths
- Check response headers include `Access-Control-Allow-Origin: *`

## References

- Netlify Functions: https://docs.netlify.com/functions/overview/
- Netlify Secrets: https://docs.netlify.com/configure-builds/environment-variables/
- API Security: https://owasp.org/www-community/attacks/API_attack
