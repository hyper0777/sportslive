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

#### Football Highlights API (Required)
```
FOOTBALL_HIGHLIGHTS_API_KEY=your-rapidapi-key
FOOTBALL_HIGHLIGHTS_API_HOST=football-highlights-api.p.rapidapi.com
```

**Get your key:**
- Visit https://rapidapi.com/api-sports/api/football-highlights
- Subscribe to the API (free tier available)
- Copy your API key from the dashboard

#### Sports Data / Country Flags (Optional)
```
ALLSPORTS_API_KEY=your-rapidapi-key
ALLSPORTS_API_HOST=allsportsapi2.p.rapidapi.com
```

### 3. Redeploy

Once environment variables are set, trigger a new deploy:
```bash
netlify deploy --prod
```

## API Sources

### Football Highlights (Required)
- **Provider:** API-Football via RapidAPI
- **Website:** https://rapidapi.com/api-sports/api/football-highlights
- **Function:** `netlify/functions/football-highlights.ts`

### Sports Data (Optional)
- **Provider:** All Sports API via RapidAPI
- **Website:** https://rapidapi.com/api-sports/api/all-sports-api
- **Function:** `netlify/functions/sports-data.ts`

## How It Works

- **Frontend** (`src/`) - Contains NO sensitive keys, makes requests to Netlify Functions
- **Netlify Function** (`netlify/functions/football-highlights.ts`) - Handles API calls using environment variables
- **Environment Variables** - Managed securely in Netlify dashboard (never exposed to frontend)

## Local Development

For local testing with sensitive keys:

```bash
# Create a .env.local file (git-ignored)
echo "FOOTBALL_HIGHLIGHTS_API_KEY=your-test-key" > .env.local
echo "FOOTBALL_HIGHLIGHTS_API_HOST=football-highlights-api.p.rapidapi.com" >> .env.local
echo "ALLSPORTS_API_KEY=your-test-key" >> .env.local
echo "ALLSPORTS_API_HOST=allsportsapi2.p.rapidapi.com" >> .env.local

# Run development server with Netlify Functions
netlify dev
```

The dev server will simulate the Netlify environment locally.

### Usage in Code

```typescript
// Football Highlights - Fetch matches
import { 
  getMatchesByDate, 
  getMatchesByLeague,
  getTeamFixtures,
  fetchFootballHighlights
} from '@/api/football-highlights';

// Fetch matches by date
const todayMatches = await getMatchesByDate('2024-01-15');

// Fetch league matches for a season
const premierLeague = await getMatchesByLeague('97798', '2023');

// Fetch team fixtures
const teamMatches = await getTeamFixtures('5700782', '1907875');

// Custom query
const matches = await fetchFootballHighlights({
  homeTeamName: 'Arsenal',
  awayTeamName: 'Chelsea',
  countryCode: 'GB',
  season: '2023'
});

// Sports Data - Optional
import { getCountryFlag } from '@/api/sports-data';
const flag = await getCountryFlag('AU');
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

**"FOOTBALL_HIGHLIGHTS_API_KEY not configured" error:**
- Check Netlify environment variables are set
- Verify spelling: `FOOTBALL_HIGHLIGHTS_API_KEY` (case-sensitive)
- Redeploy after adding variables

**CORS errors:**
- Netlify Functions handle CORS headers automatically
- Ensure requests go through `/.netlify/functions/` paths
- Verify you're calling the right endpoint in `src/api/`

**No matches showing:**
- Verify API key is valid and has available quota
- Check that the API supports the requested date/league
- Review Netlify function logs for detailed errors
