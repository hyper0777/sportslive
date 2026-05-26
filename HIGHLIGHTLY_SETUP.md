# Highlightly Sports API Integration

This application now uses **Highlightly Sports API** as the primary source for match data. The API key is securely managed through Netlify Functions - never exposed to the frontend.

## Setup Instructions

### 1. Get API Key from Highlightly

Visit https://sports.highlightly.net and register for an API key

### 2. Configure Netlify Environment Variables

In your Netlify site settings:

1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Add these variables:

```
HIGHLIGHTLY_API_KEY=your-actual-api-key
HIGHLIGHTLY_BASE_URL=https://sports.highlightly.net
```

### 3. Deploy

```bash
netlify deploy --prod
```

## Local Development

Create `.env.local` (git-ignored):

```bash
echo "HIGHLIGHTLY_API_KEY=your-test-key" > .env.local
echo "HIGHLIGHTLY_BASE_URL=https://sports.highlightly.net" >> .env.local
```

Then run:

```bash
netlify dev
```

## How It Works

```
React Components (useScoreSimulator)
          ↓
getTodaysMatches() function
          ↓
/.netlify/functions/highlightly-matches
          ↓
Highlightly Sports API
(API key never exposed to frontend)
```

## API Response Format

The Highlightly API returns match data in this format:

```json
{
  "data": [
    {
      "homeTeam": { "name": "Manchester United" },
      "awayTeam": { "name": "Liverpool" },
      "state": {
        "score": { "current": "2-1" },
        "description": "Live - Second Half"
      }
    }
  ],
  "pagination": {
    "totalCount": 15
  }
}
```

## Code Usage

```typescript
import { getTodaysMatches, formatMatches } from '@/api/highlightly-matches';

// Fetch matches
const response = await getTodaysMatches();

// Format for display
const formattedMatches = formatMatches(response);
formattedMatches.forEach(match => console.log(match));
// Output: "Manchester United vs Liverpool | 2-1 | live"
```

## Security

✅ **No hardcoded keys** in source code
✅ **Keys only in Netlify environment variables**
✅ **All API calls proxied through Netlify Functions**
✅ **Frontend never directly accesses external APIs**

## Troubleshooting

**"API key not configured" error:**
- Verify `HIGHLIGHTLY_API_KEY` is set in Netlify
- Check for typos (case-sensitive)
- Redeploy after changes

**"Failed to fetch" error:**
- Verify API key is valid and active
- Check that API endpoint is accessible
- Review Netlify function logs for details

**No matches showing:**
- Verify the API supports the current date
- Check API quota hasn't been exceeded
- Ensure response format matches expected structure
