# Quick Setup Guide - Sports API Integration

## 🚀 Getting Started (2 minutes)

### 1. Get API Key
- Go to: https://rapidapi.com/api-sports-api-sports-default/api/sport-highlights-api
- Click **"Subscribe"** (Free tier is fine)
- Copy your **API Key**

### 2. Add to Project
Create `.env.local` in the project root:
```
VITE_HIGHLIGHTLY_API_KEY=paste-your-key-here
```

### 3. Restart Dev Server
```bash
npm run dev
```

## ✅ What's Integrated

### New Components
- **Highlights** - Fetches video highlights for matches
- **TeamsGrid** - Displays teams with logos
- **LeaguesList** - Shows available leagues

### Enhanced Features
- Live API data integration in AppLayout
- Automatic fallback to mock data if API unavailable
- Real-time data source indicator in status bar
- Error messages if API key is missing/invalid

### API Client (`src/api/highlightly-client.ts`)
Ready-to-use TypeScript client with full endpoint coverage:
```typescript
import { football, basketball, hockey } from '@/api/highlightly-client';

const matches = await football.getMatches({ status: 'live' });
const teams = await football.getTeams({ league: 'Premier League' });
const highlights = await football.getHighlights();
```

## 📊 Viewing the App

1. **Home page** (`/`) - Shows all integrated components
2. **Status bar** - Shows "Data from: Highlightly API" when working
3. **New sections** - Highlights, Teams, and Leagues below the live scores

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "API error - verify key" | Check `.env.local` has correct key and restart server |
| No highlights/teams showing | API quota might be exceeded (100/day free tier) |
| Components not rendering | Check browser console for errors, ensure key is valid |

## 📖 Further Reading

- See `API_INTEGRATION.md` for complete API documentation
- Check `openapi (2).json` for all available endpoints
- OpenAPI spec includes 200+ endpoints across 6 sports

## 🎯 Next Steps

Consider:
1. **Add player stats** - Fetch individual player data
2. **Create fixtures page** - Show upcoming matches by league
3. **Add standings** - League tables with real API data
4. **Implement caching** - Store data locally to save API calls
5. **Add authentication** - User favorites/preferences

---

**Questions?** Check the API_INTEGRATION.md file for detailed documentation.
