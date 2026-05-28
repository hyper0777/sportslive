# Component Integration Guide

## New Components Overview

### 1. Highlights Component
**File:** `src/components/sports/Highlights.tsx`

**Purpose:** Display video highlights from football matches

**Features:**
- Fetches highlights automatically on mount
- Shows thumbnails with play button overlay
- Display video duration
- External video links
- Loading states and error handling
- Responsive grid layout (1-2-3 columns)

**Usage:**
```typescript
import Highlights from '@/components/sports/Highlights';

export default function Page() {
  return (
    <>
      <Highlights />
    </>
  );
}
```

**Props:** None (fetches data internally)

**Display:**
```
┌─────────────────────────────────────────┐
│ Video Highlights              All  [Football] │
├─────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│ │ [▶]     │  │ [▶]     │  │ [▶]     │ │
│ │ Thumb   │  │ Thumb   │  │ Thumb   │ │
│ │ Title   │  │ Title   │  │ Title   │ │
│ │ 12 min  │  │ 8 min   │  │ 15 min  │ │
│ └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘
```

---

### 2. TeamsGrid Component
**File:** `src/components/sports/TeamsGrid.tsx`

**Purpose:** Display football teams with logos

**Features:**
- Responsive grid layout (2-3-4 columns)
- Team logos with fallback badges
- Filterable by league and country
- Configurable item count
- Hover effects

**Usage:**
```typescript
import TeamsGrid from '@/components/sports/TeamsGrid';

// Default - fetch all teams
<TeamsGrid />

// With filters
<TeamsGrid league="Premier League" limit={12} />

// By country
<TeamsGrid country="England" limit={20} />
```

**Props:**
```typescript
interface TeamsGridProps {
  league?: string;    // Filter by league name
  country?: string;   // Filter by country name
  limit?: number;     // Max items (default: 8)
}
```

**Display:**
```
┌─────────────────────────────────────────┐
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │
│ │ [🟠] │  │ [🔵] │  │ [⚪] │  │ [🔴] │ │
│ │ Team │  │ Team │  │ Team │  │ Team │ │
│ │ Name │  │ Name │  │ Name │  │ Name │ │
│ └──────┘  └──────┘  └──────┘  └──────┘ │
├─────────────────────────────────────────┤
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │
│ │ ...  │  │ ...  │  │ ...  │  │ ...  │ │
└─────────────────────────────────────────┘
```

---

### 3. LeaguesList Component
**File:** `src/components/sports/LeaguesList.tsx`

**Purpose:** Display available football leagues

**Features:**
- Vertical list with league logos
- Season information
- Hover effects
- Filterable by country and season
- Trophy icon fallback for missing logos

**Usage:**
```typescript
import LeaguesList from '@/components/sports/LeaguesList';

// Default - show all leagues
<LeaguesList />

// Filter by country
<LeaguesList country="England" />

// Filter by season
<LeaguesList season={2024} />

// Both filters
<LeaguesList country="Spain" season={2024} />
```

**Props:**
```typescript
interface LeaguesListProps {
  country?: string;   // Filter by country
  season?: number;    // Filter by season
}
```

**Display:**
```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ [🏆] Premier League        Season... │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [🏆] La Liga               Season... │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [🏆] Bundesliga            Season... │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [🏆] Serie A               Season... │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Integration in AppLayout

The components are integrated into `src/components/AppLayout.tsx`:

```
AppLayout
├── Header (sports tabs, search)
├── Status Bar (data source indicator)
├── Main Content
│   ├── Sidebar (league filter)
│   ├── Live Stream Panel
│   ├── HeroSection (featured match)
│   ├── StatsBar (quick stats)
│   ├── QuickLinks
│   ├── LiveScores
│   ├── BettingInsights
│   ├── ⭐ Highlights          ← NEW
│   ├── ⭐ TeamsGrid           ← NEW
│   ├── ⭐ LeaguesList         ← NEW
│   ├── UpcomingMatches
│   ├── Standings
│   ├── TopScorers
│   └── NewsFeed
├── Footer
└── BackToTop
```

---

## Integration Architecture

### Data Flow

```
┌──────────────────┐
│  OpenAPI Spec    │
│  (200+ endpoints)│
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│  highlightly-client.ts       │
│  (TypeScript API client)     │
└────────┬─────────────────────┘
         │
    ┌────┴────┬─────────┬─────────────┐
    ▼         ▼         ▼             ▼
┌────────┐┌────────┐┌──────────┐┌────────────┐
│football││basket  ││hockey    ││rugby, etc. │
│methods ││methods ││methods   ││methods    │
└────────┘└────────┘└──────────┘└────────────┘
    │         │         │             │
    └────────┬┴────────┬┴─────────────┘
             ▼
    ┌──────────────────────┐
    │ useSportsData Hook   │
    │ (loading/error)      │
    └────────┬─────────────┘
             │
    ┌────────┴────────┬──────────────┐
    ▼                 ▼              ▼
┌─────────────┐┌──────────────┐┌────────────┐
│ Highlights  ││ TeamsGrid    ││LeaguesList │
│ Component   ││ Component    ││Component   │
└─────────────┘└──────────────┘└────────────┘
    │                 │              │
    └────────────────┬┴──────────────┘
                     ▼
           ┌─────────────────────┐
           │  AppLayout renders  │
           │  real API data      │
           └─────────────────────┘
```

---

## Adding More Components

### Pattern to Follow

```typescript
// 1. Import API client
import { football } from '@/api/highlightly-client';
import { useState, useEffect } from 'react';

// 2. Define component
export default function MyComponent({ league }: Props) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Fetch data on mount
  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const result = await football.getXxx({ league });
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [league]);

  // 4. Render states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  // 5. Render component
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

---

## Component Props & Configuration

### Reusable Props Pattern

All new components follow consistent props:

```typescript
interface ComponentProps {
  // Filters
  league?: string;      // League name or ID
  country?: string;     // Country name or code
  season?: number;      // Season year
  team?: string;        // Team name or ID
  
  // Pagination
  limit?: number;       // Max items to display
  page?: number;        // Page number
  
  // Callbacks
  onSelect?: (item: any) => void;  // Item selection
  onError?: (error: string) => void; // Error callback
  
  // Styling
  className?: string;   // Custom CSS classes
}
```

---

## Error States

All components handle three states:

### Loading State
```typescript
<div className="flex items-center justify-center h-64">
  <Loader className="h-8 w-8 animate-spin" />
  <p>Loading...</p>
</div>
```

### Error State
```typescript
<div className="flex items-center gap-3 p-4 bg-red-500/10">
  <AlertCircle className="h-5 w-5 text-red-400" />
  <div>
    <p className="text-red-300">Failed to load {resource}</p>
    <p className="text-red-200/70 text-sm">{error}</p>
  </div>
</div>
```

### Empty State
```typescript
<div className="flex items-center justify-center h-32">
  <p className="text-gray-400">No {resource} found</p>
</div>
```

---

## Styling System

All components use Tailwind CSS:

- **Colors:** Tailwind default palette
- **Spacing:** Consistent gap/padding scale
- **Breakpoints:** Mobile-first responsive design
- **Hover/Focus:** Smooth transitions and interactive states

### Color Scheme
```
Primary:     Orange (#FF8C42 / orange-500)
Background:  Gray-900/950 (dark theme)
Text:        White/Gray-400 (contrast)
Borders:     Gray-800 (subtle)
Hover:       Orange-500/50 (subtle highlight)
```

---

## Testing Components

### In Development
```bash
npm run dev
# View at http://localhost:5173/
```

### Building
```bash
npm run build
# Verifies all components compile
```

### Type Checking
```bash
npm run typecheck
# Ensures type safety
```

---

## Performance Considerations

1. **Lazy Loading** - Components fetch data independently
2. **No Blocking** - App doesn't wait for API responses
3. **Caching** - React state caches fetched data
4. **Error Boundaries** - Errors don't crash entire app
5. **Fallbacks** - UI works even if API fails

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- React 18+
- TypeScript 5.5+
- Tailwind CSS 3.4+

---

## Accessibility

Components include:
- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance
- Loading state announcements

---

For examples on how to use these components, see USAGE_EXAMPLES.md
