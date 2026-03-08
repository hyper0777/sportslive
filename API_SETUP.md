# Real API Integration Setup

Your sports platform is now configured to fetch live match data from API-Football.

## Getting Your API Key

1. Go to [RapidAPI API-Football](https://rapidapi.com/api-sports/api/api-football)
2. Click "Subscribe to Test" or "Pricing"
3. Choose a plan:
   - **Free Plan**: 100 requests/day (perfect for testing)
   - **Basic Plan**: More requests for production use
4. After subscribing, you'll get an API key on your dashboard

## Adding the API Key

Once you have your API key from RapidAPI:

1. In your project, the Edge Function is already deployed
2. Add the API key as a secret to your Supabase Edge Function
3. Configure the provider:

   - `FOOTBALL_API_PROVIDER=rapidapi` when using a RapidAPI subscription key (default)
   - `FOOTBALL_API_PROVIDER=apisports` when using an API-SPORTS direct subscription key

4. Use this command in your terminal:

```bash
supabase secrets set FOOTBALL_API_KEY=your_key_here FOOTBALL_API_PROVIDER=rapidapi
```

If you're using API-SPORTS directly, set `FOOTBALL_API_PROVIDER=apisports`.

## How It Works

1. **Edge Function**: The `live-scores` function fetches data from API-Football
2. **Frontend**: The app calls the Edge Function every 30 seconds to get fresh data
3. **Fallback**: If the API is unavailable, it uses simulated data
4. **Data Indicator**: The app shows which data source is being used (API, Simulated, or Edge Function)

## API Features

The API provides:
- Real-time match scores
- Live match status (scheduled, live, halftime, finished)
- Match fixtures for today
- Team information
- Venue details
- League information

## Rate Limits

- **Free Plan**: 100 requests/day
- Updates every 30 seconds means ~2,880 requests/day
- Recommendation: Increase update interval or upgrade plan for production

## Monitoring

Check the data source indicator at the top of the page:
- Green dot: Live API data
- Blue dot: Edge Function
- Yellow dot: Simulated fallback data

## Alternative APIs

You can also use:
- **TheSportsDB** (free, limited data)
- **Sportradar** (premium, comprehensive)
- **API-Football** (recommended, good balance)

## Support

If you encounter issues:
1. Check your API key is valid
2. Verify you haven't exceeded rate limits
3. Check the browser console for errors
4. The app will automatically fall back to simulated data if the API fails
