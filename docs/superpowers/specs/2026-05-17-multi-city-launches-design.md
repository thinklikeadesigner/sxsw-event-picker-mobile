# Multi-City Launches — Design

**Date:** 2026-05-17
**Status:** Draft, pending user review

## Goal

Restructure the current single-city app (SXSW / Austin) into a multi-city, multi-launch template so a New York version (and future cities like Boston) can be shipped from the same codebase without forking the repo.

## Concept model

- **City** is the primary unit. It owns one event pool, one map center, one set of venue coordinates, and one visual theme (branding, colors, fonts, name).
- **Launch** is a curated, tagged view into a city's event pool. Examples: SXSW, Austin Tech Week, NYC Tech Week. A launch is a name, a tag, an optional date window, and an optional description — not a separate dataset.
- An event belongs to exactly one city and carries zero or more launch tags. Untagged events appear only at the city's perpetual view; tagged events appear at the perpetual view *and* each launch view they're tagged for.

## URL structure

| Path | Renders |
|------|---------|
| `/` | Landing page (city tiles + pitch) |
| `/austin` | Austin perpetual view — all Austin events |
| `/austin/sxsw` | Austin events tagged `sxsw` |
| `/austin/tech-week` | Austin events tagged `tech-week` |
| `/nyc` | NYC perpetual view — all NYC events |
| `/nyc/tech-week` | NYC events tagged `tech-week` |
| `/<unknown-city>` | Landing page (treated as unknown) |
| `/austin/<unknown-launch>` | Falls through to Austin perpetual view |

## Approach

**Single repo, single Vite build, runtime city loader.** Each city is a directory under `src/cities/` with its own config, events, and coordinates. A small client-side router parses the URL, looks up the city in a registry, dynamic-imports that city's data module (so a `/nyc` visitor doesn't download Austin's events), and applies a launch filter if one is present.

This was chosen over (a) build-time per-city targets — which conflicted with the agreed subpath URL plan — and (b) a monorepo with shared core package — overkill for ~1,500 lines of app code.

## File layout

```
src/
  cities/
    index.ts                    # city registry
    austin/
      config.ts                 # name, theme, map, launches[]
      events.ts                 # Austin's CityEvent[]
      coordinates.ts            # Austin venues
    nyc/
      config.ts
      events.ts                 # initially empty
      coordinates.ts            # initially empty
  components/                   # unchanged (event-card, filters)
  views/                        # unchanged (discover, map, resolve, schedule)
  data/
    types.ts                    # CityEvent (renamed from SXSWEvent), LaunchConfig, CityConfig
  routing/
    router.ts                   # path parsing, history API, theme application
  landing/
    landing.ts                  # marketing page at /
  main.ts                       # bootstraps router
  state.ts                      # gains currentCity, currentLaunch, getActiveEvents()
  style.css                     # refactored to consume CSS custom properties
```

## Types

```ts
export interface CityEvent {
  uid: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  url: string;
  location: string;
  cost: string;
  type: string;
  rawBlock: string;
  index: number;
  tags: string[];               // NEW
}

export interface LaunchConfig {
  slug: string;                 // 'sxsw', 'tech-week' — also the tag name
  name: string;                 // 'SXSW 2026'
  window?: { start: Date; end: Date };
  description?: string;
}

export interface CityConfig {
  slug: string;                 // 'austin', 'nyc'
  name: string;                 // 'Austin', 'New York'
  theme: Record<string, string>; // CSS custom property values
  map: { center: [number, number]; zoom: number };
  launches: LaunchConfig[];
  loadEvents: () => Promise<CityEvent[]>;
  loadCoordinates: () => Promise<Record<string, [number, number]>>;
}
```

Tag slugs match launch slugs exactly. Tags are plain strings (no typed union) — flexibility for adding launches outweighs compile-time typo protection. A one-shot validation script (`scripts/validate-tags.ts`, run in CI or pre-commit) warns when an event carries a tag that doesn't match any registered launch.

## Routing

Pure client-side router in `src/routing/router.ts` using the History API. No router dependency.

**Path parsing:**

```
"/"                       → { mode: 'landing' }
"/<city>"                 → { mode: 'app', city, launch: null }
"/<city>/<launch>"        → { mode: 'app', city, launch }
"/<unknown-city>"         → { mode: 'landing', error: 'unknown-city' }
"/<city>/<unknown>"       → { mode: 'app', city, launch: null }    # forgiving
```

**Smart entry on `/`:**

1. `localStorage.lastCity` set and valid → redirect to that city.
2. Browser geolocation permission *already granted* (checked via `navigator.permissions.query({ name: 'geolocation' })` returning `'granted'`, never `'prompt'`) → use it to pick the nearest city → redirect.
3. Otherwise → render landing page.

The router never prompts for geolocation on entry. A map-view-level opt-in prompt is left for a later spec.

**Navigation:**

When the user moves between cities or launches, the router updates the URL via `history.pushState`, sets `currentCity`/`currentLaunch` in state, applies the city's theme to `:root`, and updates the document title and meta description for SEO.

## State + filtering

State adds two fields and one selector:

```ts
currentCity: CityConfig | null;
currentLaunch: LaunchConfig | null;

// Single source of truth for which events views render
getActiveEvents(): CityEvent[]
// returns currentCity.events if no launch is active
// otherwise returns events where tags.includes(currentLaunch.slug)
```

Every view (`discover`, `map`, `resolve`, `schedule`) consumes `getActiveEvents()` rather than importing an events module directly. This is the one change that makes all four views launch-aware in one place.

## Conflict detection scope

Conflicts are computed on the active filtered list. On `/austin/sxsw`, only SXSW-tagged events conflict with each other. On `/austin`, conflicts span everything in the city pool. Matches user expectation when planning around a single week and requires no new logic — the existing conflict engine just runs on the filtered set.

## Theming

Each city's `config.ts` exports a `theme` object mapping CSS custom property names to values:

```ts
theme: {
  '--color-primary': '#FF5C00',
  '--color-accent':  '#FFD400',
  '--color-bg':      '#0E0E0E',
  '--font-display':  '"Space Grotesk", sans-serif',
}
```

On city load, the router writes these to `:root.style`. `style.css` is refactored once to reference `var(--color-*)` etc. instead of literal values. The current Austin look becomes Austin's theme verbatim — no visual change for existing users.

## Map

`src/views/map.ts` reads `currentCity.map.center` and `currentCity.map.zoom` for the Leaflet init, and `currentCity.loadCoordinates()` for venue pins. No structural change.

## Landing page

Minimal v1: title, one-sentence pitch, grid of city tiles linking to each city's perpetual route. A placeholder slot for the future "events vs. advertisers" split (out of scope for this spec).

## SEO and sharing

- Router sets per-route `<title>` and `<meta name="description">` on navigation.
- OG image stays as the current static `og-image.html` for v1. Per-city OG generation is out of scope.
- `vercel.json` gets a single SPA rewrite rule sending `/<city>/*` and `/<city>` to `index.html`.

## Bundle splitting

City data modules use dynamic `import()` so each city's events file becomes its own Vite chunk. A `/nyc` visitor downloads the app shell + NYC's chunk only; Austin's ~9,600-line events file stays on the server. The landing page downloads neither city's data.

## Migration of existing data

The current `src/data/events.ts` (~9,577 lines) moves verbatim to `src/cities/austin/events.ts`. A one-shot Node script (`scripts/backfill-tags.ts`, deleted after use) reads each event and assigns tags based on its existing groupings — SXSW date window → `sxsw` tag, May–Jun Luma adds → `tech-week` tag, Method 39 events → whichever launch is appropriate. Manual review of edge cases (events that straddle multiple launches or have ambiguous fit) before committing. Untagged events remain valid; they surface only at the perpetual `/austin` view.

## Repo + package rename

`sxsw-event-picker-mobile` (repo name) and `sxsw-event-picker-v2` (package.json `name`) are city-specific labels that will feel wrong once NYC ships. Rename target is **TBD** — user to pick before the rename step. Rename is the last step in the migration order to avoid breaking links during the refactor.

## Migration order (high-level)

1. Type rename: `SXSWEvent` → `CityEvent`; add `tags: string[]` (default `[]`).
2. Move data: `src/data/events.ts` → `src/cities/austin/events.ts`, same for `coordinates.ts`.
3. Backfill Austin tags via migration script + manual review.
4. Create city registry and `austin/config.ts`. Move current theme into Austin config.
5. Add router and `getActiveEvents()` selector. Wire all four views to the selector.
6. CSS variable refactor; router applies theme on city load.
7. Landing page with Austin + NYC tiles.
8. NYC skeleton: config, empty events, empty coordinates. `/nyc` renders an empty-state.
9. `vercel.json` SPA rewrites.
10. Repo + package rename (TBD target).

The writing-plans skill will turn this into a concrete, ordered task list with verification at each step.

## Testing

The project has no test suite today. This spec does not add one. Verification is manual: load `/`, `/austin`, `/austin/sxsw`, `/austin/tech-week`, `/nyc` in `vite dev` and confirm each renders the expected state. A separate spec can introduce a real test suite when justified.

## Out of scope

- Per-city OG images.
- Geolocation permission prompt in map view.
- "Advertise your event" landing-page split.
- Yearly archival (`/austin/sxsw-2026` vs `/austin/sxsw-2027`).
- Data ingestion automation (events remain hand-curated in TS files).
- Per-city paywall changes (current `paywall.ts` stays as-is).

## Tradeoffs accepted

- **One extra click for legacy bookmarks at `/`.** Anyone with the old root URL bookmarked sees the new landing page on first visit post-launch. Accepted to preserve the landing page's purpose; rejected the alternative of auto-redirecting `/` → `/austin` temporarily.
- **No build-time city target.** Subpath URLs precluded option B; runtime loading is the right shape.
- **Plain-string tags, no typed union.** Flexibility for adding launches; build-script validation provides a softer guardrail than the TS compiler.
