# Netlify Deployment Guide

This project uses Netlify Functions to securely manage sensitive API keys. The frontend contains no hardcoded credentials.

## Setup Instructions

### 1. Deploy to Netlify

```bash
# Connect your repository to Netlify
# https://app.netlify.com

# Or deploy from CLI
npm install netlify-cli -g
netlify deploy
```

### 2. Configure Environment Variables

In your Netlify site settings:

1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Add these environment variables:

#### Football Data (Required)
```
FOOTBALL_API_KEY=your-actual-api-key
FOOTBALL_API_PROVIDER=apisports
```

**Supported providers:**
- `apisports` - API-Football (recommended)
- `rapidapi` - API-Football via RapidAPI
- `free-football-api-data` - Free Football API Data via RapidAPI

#### Sports Data / Country Flags (Optional)
```
ALLSPORTS_API_KEY=your-rapidapi-key
ALLSPORTS_API_HOST=allsportsapi2.p.rapidapi.com
```

#### Football Highlights API (Optional)
```
FOOTBALL_HIGHLIGHTS_API_KEY=your-rapidapi-key
FOOTBALL_HIGHLIGHTS_API_HOST=football-highlights-api.p.rapidapi.com
```

### 3. Redeploy

Once environment variables are set, trigger a new deploy:
```bash
netlify deploy --prod
```

## API Key Sources

### API-Football (Recommended)
- **Provider:** `apisports`
- **Website:** https://www.api-football.com
- **Notes:** Direct API access, no RapidAPI needed

### RapidAPI Options
- **Website:** https://rapidapi.com
- Search for "API Football" or "Free Football API Data"

## How It Works

- **Frontend** (`src/`) - Contains NO sensitive keys, makes requests to Netlify Functions
- **Netlify Function** (`netlify/functions/live-scores.ts`) - Handles API calls using environment variables
- **Environment Variables** - Managed securely in Netlify dashboard (never exposed to frontend)

## Local Development

For local testing with sensitive keys:

```bash
# Create a .env.local file (git-ignored)
echo "FOOTBALL_API_KEY=your-test-key" > .env.local
echo "FOOTBALL_API_PROVIDER=apisports" >> .env.local
echo "ALLSPORTS_API_KEY=your-test-key" >> .env.local
echo "ALLSPORTS_API_HOST=allsportsapi2.p.rapidapi.com" >> .env.local
echo "FOOTBALL_HIGHLIGHTS_API_KEY=your-test-key" >> .env.local
echo "FOOTBALL_HIGHLIGHTS_API_HOST=football-highlights-api.p.rapidapi.com" >> .env.local

# Run development server with Netlify Functions
netlify dev
```

The dev server will simulate the Netlify environment locally.

### Usage in Code

```typescript
// Sports Data API
import { getCountryFlag, fetchSportsData } from '@/api/sports-data';
const flagData = await getCountryFlag('AU');

// Football Highlights API
import {
  getMatchesByDate,
  getMatchesByLeague,
  getTeamFixtures
} from '@/api/football-highlights';

// Fetch matches by date
const todayMatches = await getMatchesByDate('2024-01-15');

// Fetch league matches
const premierLeague = await getMatchesByLeague('97798', '2023');

// Fetch team fixtures
const teamMatches = await getTeamFixtures('5700782', '1907875');

// Or use direct function with custom params
import { fetchFootballHighlights } from '@/api/football-highlights';
const matches = await fetchFootballHighlights({
  homeTeamName: 'Skövde AIK',
  awayTeamName: 'Västerås SK FK',
  date: '2023-08-06',
  leagueName: 'Superettan',
  countryCode: 'SE',
  season: '2023'
});
```

## Security Best Practices

✅ **Do:**
- Store all API keys in Netlify environment variables only
- Use Netlify Functions to proxy API requests
- Keep sensitive configuration out of version control

❌ **Don't:**
- Commit `.env` files with real keys
- Expose API keys in frontend code
- Use client-side API calls for authenticated endpoints

## Troubleshooting

**"Function not deployed" error:**
- Ensure `netlify.toml` is in the root directory
- Deploy with `netlify deploy --prod`

**"FOOTBALL_API_KEY not configured" error:**
- Check Netlify environment variables are set
- Verify spelling: `FOOTBALL_API_KEY` (case-sensitive)
- Redeploy after adding variables

**CORS errors:**
- Netlify Functions handle CORS headers automatically
- Ensure requests go through `/.netlify/functions/` paths
