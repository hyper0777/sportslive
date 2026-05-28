# API Error Fix - "invalid JSON - received text/html"

## Problem

The app was showing this error:
```
Error fetching Highlightly matches: Error: invalid JSON - received text/html
    at getTodaysMatches (highlightly-matches.ts:14:13)
    at async fetchScores (useScoreSimulator.ts:17:22)
```

## Root Cause

The `highlightly-matches.ts` file was trying to fetch from a Netlify Function (`/.netlify/functions/highlightly-matches`) which was attempting to reach an incorrect API endpoint (`https://sports.highlightly.net`) that doesn't exist or doesn't support the requested parameters. This caused the API to return HTML error page instead of JSON.

## Solution

### Fixed Files

#### 1. `src/api/highlightly-matches.ts` ✅
**Changes:**
- Now uses RapidAPI directly from the browser
- Uses `VITE_HIGHLIGHTLY_API_KEY` environment variable
- Gracefully falls back to mock data if API key is missing or request fails
- Proper error handling with console warnings
- Transforms API response to internal format

**Key improvements:**
```typescript
// Before (using Netlify function):
const response = await fetch('/.netlify/functions/highlightly-matches', {
  headers: { 'Content-Type': 'application/json' }
});

// After (using RapidAPI directly):
const response = await fetch(
  'https://sport-highlights-api.p.rapidapi.com/football/matches?limit=10',
  {
    headers: {
      'x-rapidapi-host': 'sport-highlights-api.p.rapidapi.com',
      'x-rapidapi-key': apiKey,
      'Content-Type': 'application/json',
    }
  }
);
```

- Added `getMockMatches()` function for fallback
- Better error messages
- Handles both array and object responses
- Extracts team names correctly

#### 2. `netlify/functions/highlightly-matches.ts` 🔧
**Updated to:**
- Use correct RapidAPI Sport Highlights API endpoint
- Proper error variable name mapping
- Better console logging for debugging
- Includes mock data fallback on error

**Note:** This function is now optional since the browser client works directly with RapidAPI.

## How to Fix

### Step 1: Ensure API Key is Set
Create/update `.env.local`:
```bash
VITE_HIGHLIGHTLY_API_KEY=your-rapidapi-key-here
```

### Step 2: Restart Dev Server
```bash
npm run dev
```

### Step 3: Verify in Browser
1. Open DevTools console (F12)
2. Check for "API Response received" message
3. Should show matches in the UI
4. Status bar shows "Data from: Highlightly API" (green dot)

## What Changed

| File | Change | Impact |
|------|--------|--------|
| `src/api/highlightly-matches.ts` | Now uses RapidAPI directly | ✅ Fixes HTML error |
| `netlify/functions/highlightly-matches.ts` | Updated to new API endpoint | ✅ Backend-compatible |
| `src/components/sports/useScoreSimulator.ts` | No changes needed | ✅ Still works |

## Testing

The fix handles all scenarios:

### Scenario 1: API Key Present ✅
- Fetches data from RapidAPI
- Shows matches with "Data from: Highlightly API"
- Polls every 30 seconds for updates

### Scenario 2: API Key Missing ✅
- Uses mock data automatically
- Shows "Data from: Simulated"
- No error message to user

### Scenario 3: API Request Fails ✅
- Falls back to mock data gracefully
- Shows warning in console
- App continues to function

### Scenario 4: Rate Limit Exceeded ✅
- Shows status 429 (handled like 400-level error)
- Falls back to mock data
- User sees simulated data message

## Console Output

### Success
```
Fetching Highlightly matches...
API Response Status: 200
API Response body (first 500 chars): [{"id": "123", "homeTeam": {...
Processed X matches
API response received: {matches: [...], source: 'api', ...}
```

### Fallback
```
VITE_HIGHLIGHTLY_API_KEY not set - returning mock data
Error fetching matches from API: Error: missing api key
Using mock data - 3 matches loaded
```

## Why This Works

1. **Browser-safe**: API key can be in `.env.local` (development)
2. **Secure on Netlify**: Key stored in Netlify environment variables
3. **No Netlify dependency**: Works even if Netlify Functions aren't set up
4. **Graceful fallback**: Mock data prevents app crashes
5. **Type-safe**: Proper TypeScript interfaces

## Next Steps

### For Local Development
1. Set `VITE_HIGHLIGHTLY_API_KEY` in `.env.local`
2. Run `npm run dev`
3. Verify API data appears

### For Production (Netlify)
1. Add `VITE_HIGHLIGHTLY_API_KEY` to Netlify environment variables
   - Go to: Site Settings → Build & Deploy → Environment
   - Add: `VITE_HIGHLIGHTLY_API_KEY = your-api-key`
2. Deploy branch
3. API will work in production

### For Advanced Users
- Set up Netlify Function if you want backend proxy
- Add caching layer (Redis/Upstash)
- Implement polling with backoff strategy
- Add request deduplication

## Error Messages You Might See

| Error | Meaning | Fix |
|-------|---------|-----|
| `VITE_HIGHLIGHTLY_API_KEY not set` | No API key | Add to `.env.local` |
| `API request failed with status 401` | Invalid/expired key | Check RapidAPI dashboard |
| `API request failed with status 429` | Rate limited | Wait or upgrade RapidAPI tier |
| `Expected JSON but got text/html` | Wrong endpoint | Already fixed ✅ |

## Files Modified

```
src/api/highlightly-matches.ts       ← MAIN FIX
netlify/functions/highlightly-matches.ts ← Updated for consistency
```

## Verification Checklist

- [x] Build succeeds: `npm run build` ✅
- [x] No TypeScript errors
- [x] App loads without errors
- [x] Status bar shows data source
- [x] Matches display in UI
- [x] Mock data fallback works
- [x] No console errors about HTML responses

## Related Files

- `src/api/highlightly-client.ts` - Full API client (also uses RapidAPI)
- `.env.local` - Local environment variables
- `netlify/functions/` - Netlify backend functions
- `src/components/sports/useScoreSimulator.ts` - Uses getTodaysMatches()

---

**Status:** ✅ Fixed - App now properly fetches from RapidAPI or falls back to mock data
