# Multi-City Launches Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the single-city (SXSW/Austin) Vite app into a multi-city, multi-launch template so an empty NYC instance can ship from the same codebase, with subpath routing (`/`, `/austin`, `/austin/sxsw`, `/nyc`) and per-city theming.

**Architecture:** Single Vite build with runtime city loading. Each city lives in `src/cities/<slug>/` (config + dynamic-imported events/coordinates). A client-side router parses URL → city/launch, applies a tag filter via a `getActiveEvents()` selector that all four views consume. Per-city theming via CSS custom properties written to `:root` on city load.

**Tech Stack:** TypeScript, Vite 7, Leaflet, Vercel (for SPA rewrites + analytics). No new dependencies.

**Spec:** [`docs/superpowers/specs/2026-05-17-multi-city-launches-design.md`](../specs/2026-05-17-multi-city-launches-design.md)

**Testing approach:** This project has no test suite (approved in spec). Each task uses **manual browser verification** in place of TDD: run `npm run dev`, open the relevant route, confirm the expected behavior. If you'd like to add a real test suite, that's a separate plan — do not introduce one inside this refactor.

**Repo rename:** Step 13 is **intentionally omitted** from this plan. The repo + package rename target is TBD; the user will pick a name and execute that step separately once this refactor is complete.

---

## Task 1: Add `tags: string[]` field to event type and rename `SXSWEvent` → `CityEvent`

**Files:**
- Modify: `src/data/types.ts`
- Modify: `src/data/events.ts` (loader emits `tags: []`)
- Modify (mechanical find/replace): `src/state.ts`, `src/data/conflicts.ts`, `src/views/map.ts`, anywhere else `SXSWEvent` appears

- [ ] **Step 1: Update `src/data/types.ts`**

Replace the `SXSWEvent` interface with:

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
  tags: string[];
}
```

Leave `RawEvent`, `Conflict`, `ViewMode`, `Filters` unchanged.

- [ ] **Step 2: Find every reference to `SXSWEvent` and rename**

Run:

```bash
grep -rln 'SXSWEvent' src/
```

For each file, replace `SXSWEvent` with `CityEvent` and update the import statement. Expected files: `src/state.ts`, `src/data/conflicts.ts`, `src/data/events.ts`, `src/views/map.ts`. There may be others — grep is authoritative.

- [ ] **Step 3: Update the event loader to emit `tags: []`**

In `src/data/events.ts`, inside the `events.push({...})` block in `loadEvents()`, add the line `tags: [],` alongside the existing fields:

```ts
events.push({
  uid: d.uid,
  summary: d.summary,
  description: d.description || '',
  start: parseLocalDate(d.dtstart),
  end: parseLocalDate(d.dtend),
  url: d.url,
  location: d.location,
  cost: d.cost,
  type: d.type,
  rawBlock: d.rawBlock,
  index: events.length,
  tags: [],
});
```

- [ ] **Step 4: Verify TypeScript compiles**

Run:

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors. If any `SXSWEvent` reference was missed, fix it and re-run.

- [ ] **Step 5: Verify the app still runs**

Run:

```bash
npm run dev
```

Open `http://localhost:5173/`. Expected: the app loads exactly as before (events render in Discover, map works, schedule works). The `tags: []` field is present on every event but no behavior depends on it yet.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/data/types.ts src/data/events.ts src/state.ts src/data/conflicts.ts src/views/map.ts
git commit -m "refactor: rename SXSWEvent to CityEvent, add tags field"
```

---

## Task 2: Add `LaunchConfig` and `CityConfig` types

**Files:**
- Modify: `src/data/types.ts`

- [ ] **Step 1: Append the new interfaces to `src/data/types.ts`**

```ts
export interface LaunchConfig {
  slug: string;                                 // e.g. 'sxsw', 'tech-week' — also the tag name
  name: string;                                 // e.g. 'SXSW 2026'
  window?: { start: Date; end: Date };
  description?: string;
}

export interface CityConfig {
  slug: string;                                 // e.g. 'austin', 'nyc'
  name: string;                                 // e.g. 'Austin', 'New York'
  theme: Record<string, string>;                // CSS custom property values, e.g. { '--color-primary': '#FF5C00' }
  map: { center: [number, number]; zoom: number };
  launches: LaunchConfig[];
  loadEvents: () => Promise<CityEvent[]>;
  loadCoordinates: () => Promise<Record<string, [number, number]>>;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:

```bash
npm run build
```

Expected: build succeeds. No behavior change — these types are unused so far.

- [ ] **Step 3: Commit**

```bash
git add src/data/types.ts
git commit -m "refactor: add LaunchConfig and CityConfig types"
```

---

## Task 3: Move Austin data files to `src/cities/austin/`

**Files:**
- Move: `src/data/events.ts` → `src/cities/austin/events.ts`
- Move: `src/data/coordinates.ts` → `src/cities/austin/coordinates.ts`
- Modify (imports): `src/state.ts`, `src/views/map.ts`

- [ ] **Step 1: Create the directory and move files with git**

```bash
mkdir -p src/cities/austin
git mv src/data/events.ts src/cities/austin/events.ts
git mv src/data/coordinates.ts src/cities/austin/coordinates.ts
```

- [ ] **Step 2: Fix the import inside the moved `events.ts`**

In `src/cities/austin/events.ts`, change the type import at the top:

```ts
// Before
import { RawEvent, CityEvent } from './types';

// After
import { RawEvent, CityEvent } from '../../data/types';
```

- [ ] **Step 3: Update the import in `src/state.ts`**

```ts
// Before
import { loadEvents } from './data/events';

// After
import { loadEvents } from './cities/austin/events';
```

- [ ] **Step 4: Update the import in `src/views/map.ts`**

```ts
// Before
import { VENUE_COORDS } from '../data/coordinates';

// After
import { VENUE_COORDS } from '../cities/austin/coordinates';
```

- [ ] **Step 5: Verify the app still runs**

Run:

```bash
npm run dev
```

Open `http://localhost:5173/`. Expected: app loads identically to before. Map shows pins. Discover shows events. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add -A src/
git commit -m "refactor: move Austin data into src/cities/austin/"
```

---

## Task 4: Create the city registry and Austin's `CityConfig`

**Files:**
- Create: `src/cities/austin/config.ts`
- Create: `src/cities/index.ts`

- [ ] **Step 1: Create `src/cities/austin/config.ts`**

```ts
import { CityConfig } from '../../data/types';

export const austinConfig: CityConfig = {
  slug: 'austin',
  name: 'Austin',
  theme: {
    '--color-bg': '#0f0f0f',
    '--color-surface': '#1a1a1a',
    '--color-border': '#333333',
    '--color-text': '#e0e0e0',
    '--color-text-muted': '#888888',
    '--color-text-faint': '#555555',
    '--color-primary': '#4ade80',
    '--color-accent': '#22d3ee',
  },
  map: {
    center: [30.2672, -97.7431],   // matches current hardcoded value in views/map.ts
    zoom: 14,
  },
  launches: [
    {
      slug: 'sxsw',
      name: 'SXSW 2026',
      window: {
        start: new Date(2026, 2, 9),     // March 9, 2026
        end:   new Date(2026, 2, 18),    // March 18, 2026
      },
      description: 'Music, film, tech & interactive — South by Southwest 2026.',
    },
    {
      slug: 'tech-week',
      name: 'Austin Tech Week',
      window: {
        start: new Date(2026, 4, 4),     // May 4, 2026 — adjust if your records show different dates
        end:   new Date(2026, 4, 11),    // May 11, 2026
      },
      description: 'Curated tech, founder, and AI events across Austin.',
    },
  ],
  loadEvents: () => import('./events').then(m => m.loadEvents()),
  loadCoordinates: () => import('./coordinates').then(m => m.VENUE_COORDS),
};
```

NOTE: The `Austin Tech Week` date window is a placeholder based on the recent Luma commits ("May–Jun 2026"). The user should confirm or adjust the actual Tech Week dates before merging.

- [ ] **Step 2: Create `src/cities/index.ts`**

```ts
import { CityConfig } from '../data/types';
import { austinConfig } from './austin/config';

export const CITIES: Record<string, CityConfig> = {
  austin: austinConfig,
};

export function getCity(slug: string): CityConfig | null {
  return CITIES[slug] ?? null;
}

export function listCities(): CityConfig[] {
  return Object.values(CITIES);
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:

```bash
npm run build
```

Expected: build succeeds. The new types are wired but nothing consumes them yet.

- [ ] **Step 4: Commit**

```bash
git add src/cities/austin/config.ts src/cities/index.ts
git commit -m "feat: add city registry with Austin CityConfig"
```

---

## Task 5: Backfill `tags` on existing Austin events

**Files:**
- Create (temporary): `scripts/backfill-tags.ts`
- Modify: `src/cities/austin/events.ts` (after running the script)

- [ ] **Step 1: Create the backfill script `scripts/backfill-tags.ts`**

This is a one-shot script that reads the existing event data and assigns tags based on date windows. It will be deleted after use.

```ts
// scripts/backfill-tags.ts
// One-shot. Reads src/cities/austin/events.ts, classifies each event by date window,
// and writes back the file with `tags: [...]` populated. Deleted after running.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FILE = resolve(__dirname, '../src/cities/austin/events.ts');
const src = readFileSync(FILE, 'utf8');

// Each event block is a `{ ... }` literal inside EVENTS_DATA.
// Parse dtstart for each, decide tags, and inject `tags: [...]` in the loader.
// Simpler: leave EVENTS_DATA untouched and edit loadEvents() so that tag assignment
// is computed at load time. The script just writes a tag-classification function.

// We'll inject this helper after parseLocalDate:
const TAG_CLASSIFIER = `
function classifyTags(start: Date): string[] {
  const tags: string[] = [];
  // SXSW 2026: March 9–18, 2026
  const sxswStart = new Date(2026, 2, 9);
  const sxswEnd   = new Date(2026, 2, 19);
  if (start >= sxswStart && start < sxswEnd) tags.push('sxsw');
  // Austin Tech Week: May 4–11, 2026 (placeholder — user to confirm)
  const twStart = new Date(2026, 4, 4);
  const twEnd   = new Date(2026, 4, 12);
  if (start >= twStart && start < twEnd) tags.push('tech-week');
  return tags;
}
`;

// Edit the loader to call classifyTags
let updated = src;
if (!updated.includes('function classifyTags')) {
  updated = updated.replace(
    /function parseLocalDate\([\s\S]*?\n\}/,
    (m) => m + '\n' + TAG_CLASSIFIER,
  );
}
updated = updated.replace(
  /tags: \[\],/g,
  'tags: classifyTags(parseLocalDate(d.dtstart)),',
);

writeFileSync(FILE, updated);
console.log('Tags backfilled. Review the diff before committing.');
```

- [ ] **Step 2: Run the script**

```bash
npx tsx scripts/backfill-tags.ts
```

If `tsx` is not installed, run:

```bash
npx --yes tsx scripts/backfill-tags.ts
```

Expected output: `Tags backfilled. Review the diff before committing.`

- [ ] **Step 3: Manually review the diff**

Run:

```bash
git diff src/cities/austin/events.ts
```

Expected: a `classifyTags(...)` helper added; every `tags: [],` replaced with `tags: classifyTags(parseLocalDate(d.dtstart)),`. No event data fields touched.

Open `src/cities/austin/events.ts` and skim the inserted `classifyTags` function — confirm the SXSW window dates match your real festival dates. Adjust the Tech Week window if you have firmer dates.

- [ ] **Step 4: Verify the app still runs and tags are populated**

Run:

```bash
npm run dev
```

Open `http://localhost:5173/`, open browser devtools console, paste:

```js
// Quick check: log a few tagged events
fetch('/').then(() => {
  // Re-open the page first; this is illustrative — just inspect state in console
});
```

Easier: in the running app, open devtools → Sources → set a breakpoint inside `loadEvents` or just `console.log` the first 5 events' tags. Expected: SXSW-window events show `['sxsw']`, Tech Week events show `['tech-week']`, others show `[]`.

Stop the dev server.

- [ ] **Step 5: Delete the script**

```bash
rm scripts/backfill-tags.ts
```

(If `scripts/` is now empty, you may also remove the directory — but check whether anything else lives there first with `ls scripts/`.)

- [ ] **Step 6: Commit**

```bash
git add src/cities/austin/events.ts
git rm scripts/backfill-tags.ts 2>/dev/null || true
git commit -m "data: backfill SXSW and Tech Week tags on Austin events"
```

---

## Task 6: Add the router

**Files:**
- Create: `src/routing/router.ts`

- [ ] **Step 1: Create `src/routing/router.ts`**

```ts
import { CityConfig } from '../data/types';
import { getCity, listCities } from '../cities';

export type Route =
  | { mode: 'landing'; error?: 'unknown-city' }
  | { mode: 'app'; city: CityConfig; launchSlug: string | null };

export function parsePath(pathname: string): Route {
  // Normalize: strip trailing slash, leading slash
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

  if (parts.length === 0) {
    return { mode: 'landing' };
  }

  const city = getCity(parts[0]);
  if (!city) {
    return { mode: 'landing', error: 'unknown-city' };
  }

  if (parts.length === 1) {
    return { mode: 'app', city, launchSlug: null };
  }

  // Unknown launch slug falls through to the perpetual city view.
  const launchExists = city.launches.some(l => l.slug === parts[1]);
  return { mode: 'app', city, launchSlug: launchExists ? parts[1] : null };
}

export function applyTheme(theme: Record<string, string>): void {
  for (const [key, value] of Object.entries(theme)) {
    document.documentElement.style.setProperty(key, value);
  }
}

export function setDocumentMeta(city: CityConfig | null, launchSlug: string | null): void {
  if (!city) {
    document.title = 'Local Events Picker';
    return;
  }
  const launch = launchSlug ? city.launches.find(l => l.slug === launchSlug) : null;
  document.title = launch ? `${launch.name} — ${city.name}` : `${city.name} Events`;

  let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = launch?.description ?? `Curated events in ${city.name}.`;
}

export function navigate(path: string): void {
  history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export async function pickSmartEntry(): Promise<string | null> {
  // 1. Last-visited city
  const last = localStorage.getItem('lastCity');
  if (last && getCity(last)) {
    return `/${last}`;
  }

  // 2. Geolocation — only if permission already granted, never prompt
  try {
    if ('permissions' in navigator) {
      const perm = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (perm.state === 'granted') {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        const nearest = nearestCity(pos.coords.latitude, pos.coords.longitude);
        if (nearest) return `/${nearest.slug}`;
      }
    }
  } catch {
    // Fall through to landing
  }

  // 3. Landing
  return null;
}

function nearestCity(lat: number, lng: number): CityConfig | null {
  let best: CityConfig | null = null;
  let bestDist = Infinity;
  for (const city of listCities()) {
    const [cLat, cLng] = city.map.center;
    const d = (lat - cLat) ** 2 + (lng - cLng) ** 2;
    if (d < bestDist) { bestDist = d; best = city; }
  }
  return best;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:

```bash
npm run build
```

Expected: build succeeds. The router is defined but not yet wired into `main.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/routing/router.ts
git commit -m "feat: add client-side router with smart entry"
```

---

## Task 7: Refactor `state.ts` to be city-aware

**Files:**
- Modify: `src/state.ts`
- Modify: `src/data/conflicts.ts` (no signature change; just CityEvent type)

- [ ] **Step 1: Replace `src/state.ts`**

Full file replacement (the existing file is 135 lines; this is the city-aware version):

```ts
import { CityEvent, Conflict, ViewMode, Filters, CityConfig, LaunchConfig } from './data/types';
import { detectConflicts } from './data/conflicts';

const STORAGE_KEY_BASE = 'sxsw2026-v2';

interface AppState {
  city: CityConfig | null;
  launch: LaunchConfig | null;
  events: CityEvent[];                  // all events for the active city
  starred: Set<number>;
  conflicts: Conflict[];
  currentView: ViewMode;
  currentDay: string;
  filters: Filters;
  resolveIndex: number;
}

const state: AppState = {
  city: null,
  launch: null,
  events: [],
  starred: new Set(),
  conflicts: [],
  currentView: 'discover',
  currentDay: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })(),
  filters: { cost: 'all', type: 'all', search: '' },
  resolveIndex: 0,
};

let renderCallback: (() => void) | null = null;

export function onStateChange(cb: () => void) { renderCallback = cb; }
function notify() { renderCallback?.(); }

export function getState() { return state; }

// Returns events filtered by the active launch tag. If no launch is active,
// returns all events for the active city.
export function getActiveEvents(): CityEvent[] {
  if (!state.launch) return state.events;
  const tag = state.launch.slug;
  return state.events.filter(e => e.tags.includes(tag));
}

function storageKey(): string {
  return state.city ? `${STORAGE_KEY_BASE}:${state.city.slug}` : STORAGE_KEY_BASE;
}

export async function initCity(city: CityConfig, launchSlug: string | null) {
  state.city = city;
  state.launch = launchSlug ? city.launches.find(l => l.slug === launchSlug) ?? null : null;
  state.events = await city.loadEvents();
  state.starred = new Set();
  state.conflicts = [];
  state.resolveIndex = 0;
  loadFromStorage();
  recomputeConflicts();
  notify();
}

export function setLaunch(launchSlug: string | null) {
  if (!state.city) return;
  state.launch = launchSlug ? state.city.launches.find(l => l.slug === launchSlug) ?? null : null;
  recomputeConflicts();
  notify();
}

export function resetCity() {
  state.city = null;
  state.launch = null;
  state.events = [];
  state.starred = new Set();
  state.conflicts = [];
  notify();
}

export function toggleStar(index: number) {
  if (state.starred.has(index)) state.starred.delete(index);
  else state.starred.add(index);
  recomputeConflicts();
  saveToStorage();
  notify();
}

export function setView(view: ViewMode) {
  state.currentView = view;
  if (view === 'resolve') state.resolveIndex = 0;
  saveToStorage();
  notify();
}

export function setDay(day: string) {
  state.currentDay = day;
  notify();
}

export function setFilter(key: keyof Filters, value: string) {
  state.filters[key] = value;
  notify();
}

export function resolveConflict(conflictId: string, winnerIndex: number) {
  const conflict = state.conflicts.find(c => c.id === conflictId);
  if (!conflict) return;
  conflict.resolved = true;
  conflict.winner = winnerIndex;
  const loser = conflict.eventA === winnerIndex ? conflict.eventB : conflict.eventA;
  state.starred.delete(loser);
  recomputeConflicts();
  saveToStorage();
  notify();
}

export function skipConflict() {
  const unresolved = state.conflicts.filter(c => !c.resolved);
  if (unresolved.length > 1) {
    state.resolveIndex = (state.resolveIndex + 1) % unresolved.length;
  }
  notify();
}

export function starAll(indices: number[]) {
  indices.forEach(i => state.starred.add(i));
  recomputeConflicts();
  saveToStorage();
  notify();
}

export function clearStars(indices?: number[]) {
  if (indices) indices.forEach(i => state.starred.delete(i));
  else state.starred.clear();
  recomputeConflicts();
  saveToStorage();
  notify();
}

function recomputeConflicts() {
  const oldResolutions = new Map(
    state.conflicts.filter(c => c.resolved).map(c => [c.id, c])
  );
  // Conflicts are scoped to the active filtered list — only events in the current
  // launch (or all city events when no launch is active) can conflict with each other.
  state.conflicts = detectConflicts(getActiveEvents(), state.starred);
  for (const c of state.conflicts) {
    const old = oldResolutions.get(c.id);
    if (old) { c.resolved = old.resolved; c.winner = old.winner; }
  }
}

function saveToStorage() {
  if (!state.city) return;
  try {
    localStorage.setItem(storageKey(), JSON.stringify({
      starred: [...state.starred],
      conflicts: state.conflicts,
      currentDay: state.currentDay,
      currentView: state.currentView,
    }));
  } catch {}
}

function loadFromStorage() {
  if (!state.city) return;
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.starred) state.starred = new Set(data.starred);
    if (data.conflicts) state.conflicts = data.conflicts;
    const today = state.currentDay;
    if (data.currentDay && data.currentDay >= today) state.currentDay = data.currentDay;
    if (data.currentView) state.currentView = data.currentView;
  } catch {}
}
```

Key changes from the previous `state.ts`:
- Added `city`, `launch`, and replaced the static `init()` with async `initCity(city, launchSlug)`.
- New exported `getActiveEvents()` selector.
- `recomputeConflicts()` uses `getActiveEvents()` (launch-scoped).
- `STORAGE_KEY` is now city-namespaced via `storageKey()` to prevent Austin/NYC bleed.
- Removed the direct `loadEvents` import — events come from `city.loadEvents()`.

- [ ] **Step 2: Verify `src/data/conflicts.ts` accepts the new type**

Open `src/data/conflicts.ts` and confirm the signature is:

```ts
export function detectConflicts(events: CityEvent[], starredIndices: Set<number>): Conflict[]
```

(After Task 1's rename, `SXSWEvent` should already be `CityEvent`.) If not, fix it now.

- [ ] **Step 3: Verify TypeScript compiles**

Run:

```bash
npm run build
```

Expected: build succeeds OR you see compile errors in `main.ts` because `init` no longer exists. That's expected — `main.ts` is rewritten in Task 8. Note any errors; if the only errors are in `main.ts`, proceed.

- [ ] **Step 4: Commit**

```bash
git add src/state.ts src/data/conflicts.ts
git commit -m "refactor: make state city-aware with getActiveEvents selector"
```

---

## Task 8: Wire `main.ts` to the router

**Files:**
- Create (stub): `src/landing/landing.ts` (real implementation in Task 10)
- Modify: `src/main.ts`
- Modify: `index.html`

- [ ] **Step 1: Create a temporary `src/landing/landing.ts` stub**

The new `main.ts` imports `renderLanding` from `./landing/landing`. Task 10 creates the real implementation; for now, a stub keeps the build green:

```ts
// src/landing/landing.ts — STUB. Replaced by the real implementation in Task 10.
export function renderLanding(container: HTMLElement) {
  container.innerHTML = '<div style="padding: 80px 24px; text-align: center; color: var(--color-text-muted, #888);">Landing page coming in Task 10.</div>';
}
```

- [ ] **Step 2: Replace `src/main.ts`**

Full replacement:

```ts
import './style.css';
import { inject } from '@vercel/analytics';
import { initCity, onStateChange, getState, setView, setLaunch, resetCity } from './state';
import { renderDiscover } from './views/discover';
import { renderResolve } from './views/resolve';
import { renderSchedule } from './views/schedule';
import { renderMap, destroyMap } from './views/map';
import { renderFilters } from './components/filters';
import { ViewMode } from './data/types';
import { checkUnlockFromUrl } from './paywall';
import { parsePath, applyTheme, setDocumentMeta, pickSmartEntry, navigate } from './routing/router';
import { renderLanding } from './landing/landing';

inject();

function render() {
  const state = getState();
  const content = document.getElementById('content')!;
  const controls = document.getElementById('controls')!;
  const appShell = document.getElementById('app-shell');

  // Landing-mode short-circuit
  if (!state.city) {
    if (appShell) appShell.style.display = 'none';
    renderLanding(content);
    return;
  }
  if (appShell) appShell.style.display = '';

  // Update stats
  document.getElementById('starred-count')!.textContent = String(state.starred.size);
  const unresolvedCount = state.conflicts.filter(c => !c.resolved).length;
  document.getElementById('conflict-count')!.textContent = String(unresolvedCount);
  const badge = document.getElementById('resolve-badge')!;
  badge.textContent = String(unresolvedCount);
  badge.style.display = unresolvedCount > 0 ? '' : 'none';

  // Update active tab
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-view') === state.currentView);
  });

  if (state.currentView !== 'map') destroyMap();

  document.body.classList.toggle('view-map', state.currentView === 'map');
  if (state.currentView === 'map') {
    const stickyTop = document.querySelector('.sticky-top') as HTMLElement;
    const banner = document.querySelector('.wrap-banner') as HTMLElement;
    const h = (stickyTop?.offsetHeight || 0) + (banner?.offsetHeight || 0);
    document.documentElement.style.setProperty('--sticky-top-h', h + 'px');
  }

  controls.style.display = (state.currentView === 'discover' || state.currentView === 'map') ? '' : 'none';

  switch (state.currentView) {
    case 'discover': renderFilters(); renderDiscover(content); break;
    case 'map':      renderFilters(); renderMap(content);      break;
    case 'resolve':  renderResolve(content);                    break;
    case 'schedule': renderSchedule(content);                   break;
  }
}

async function routeAndRender() {
  const route = parsePath(window.location.pathname);

  if (route.mode === 'landing') {
    // If at exactly "/", run smart entry once
    if (window.location.pathname === '/' && !route.error) {
      const target = await pickSmartEntry();
      if (target) {
        navigate(target);     // triggers popstate → re-enters routeAndRender
        return;
      }
    }
    // Render landing — clear any active city in state
    setDocumentMeta(null, null);
    if (getState().city) {
      resetCity();           // triggers notify → render via onStateChange
    } else {
      render();
    }
    return;
  }

  // App mode
  applyTheme(route.city.theme);
  setDocumentMeta(route.city, route.launchSlug);
  localStorage.setItem('lastCity', route.city.slug);

  const current = getState();
  if (current.city?.slug === route.city.slug) {
    // Same city — just swap the launch. No event reload, starred state preserved.
    setLaunch(route.launchSlug);
  } else {
    // New city — full init (loads events, resets per-city state from storage).
    await initCity(route.city, route.launchSlug);
  }
  // setLaunch / initCity both call notify() → render() via onStateChange.
}

document.addEventListener('DOMContentLoaded', () => {
  checkUnlockFromUrl();
  onStateChange(render);

  window.addEventListener('popstate', () => { routeAndRender(); });

  // Tab navigation
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setView(tab.getAttribute('data-view') as ViewMode);
    });
  });

  // Filters always visible — hide the toggle
  const filterToggle = document.getElementById('filter-toggle');
  if (filterToggle) filterToggle.style.display = 'none';

  // Position sticky header below sticky banner
  function updateStickyOffset() {
    const banner = document.getElementById('wrap-banner');
    const stickyTop = document.querySelector('.sticky-top') as HTMLElement;
    if (stickyTop) {
      const bannerH = banner && banner.style.display !== 'none' ? banner.offsetHeight : 0;
      stickyTop.style.top = bannerH + 'px';
    }
  }
  updateStickyOffset();

  const banner = document.getElementById('wrap-banner');
  if (banner && localStorage.getItem('banner-dismissed')) {
    banner.style.display = 'none';
    updateStickyOffset();
    const li = document.getElementById('linkedin-link');
    if (li) li.classList.add('glow');
  }
  document.getElementById('banner-close')?.addEventListener('click', () => {
    if (banner) banner.style.display = 'none';
    localStorage.setItem('banner-dismissed', '1');
    updateStickyOffset();
    const li = document.getElementById('linkedin-link');
    if (li) li.classList.add('glow');
  });

  routeAndRender();
});
```

- [ ] **Step 3: Wire the four views to `getActiveEvents()`**

Without this step, the views read `state.events` (the full city pool) and ignore the launch filter — so `/austin/sxsw` would still show every Austin event.

In `src/views/discover.ts`, replace the destructuring:

```ts
// Before
const { events, starred, currentDay, filters, conflicts } = getState();

// After
import { getActiveEvents } from '../state';
// ... (existing imports)

export function renderDiscover(container: HTMLElement) {
  const { starred, currentDay, filters, conflicts } = getState();
  const events = getActiveEvents();
  // ... rest of body unchanged
```

Repeat the same pattern in `src/views/map.ts`, `src/views/schedule.ts`, and `src/views/resolve.ts`. For each: import `getActiveEvents` from `'../state'`, then replace `getState().events` or `state.events` references with `getActiveEvents()`.

The `paywall.ts` helpers (`countLockedMusic`, `countTotalMusic`) keep their existing signatures — they take an `events` array. Pass `getActiveEvents()` when calling them from discover so paywall counts scope to the active launch:

```ts
// In discover.ts, where paywall counts are computed:
const lockedCount = countLockedMusic(events, dayKey, currentDay);   // events is already getActiveEvents()
const totalMusic = countTotalMusic(events);
```

If `events` is already the rebound `getActiveEvents()` result, no further change needed.

Verify with grep that no view still reads `state.events` directly:

```bash
grep -n 'state.events\|\.events\b' src/views/*.ts src/components/*.ts
```

Any remaining `events` references should come from local destructuring or `getActiveEvents()`, not from a state object.

- [ ] **Step 4: Add an `app-shell` wrapper id to `index.html`**

Open `index.html`. Find the existing top-level container that wraps the header, stats, content, etc. (likely a `<div class="app">` or similar). Add `id="app-shell"` to it so that landing mode can hide it. If no such wrapper exists, wrap everything except the `<div id="content">` in `<div id="app-shell">...</div>` — but keep `#content` outside the shell so the landing page can render into it.

If unsure of the right wrapper, this is the minimal safe edit: add a new wrapper around the header + nav + controls only, leaving `#content` accessible:

```html
<!-- index.html (sketch) -->
<div id="app-shell">
  <header>...</header>
  <div class="sticky-top">...</div>
  <div id="controls">...</div>
</div>
<div id="content"></div>
<!-- footer stays outside -->
```

Read `index.html` first to confirm the actual structure before editing.

- [ ] **Step 5: Verify the build compiles**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Verify `/austin` renders in dev**

Run:

```bash
npm run dev
```

Open `http://localhost:5173/austin`. Expected: the app renders exactly as the old `/` used to (Discover view with events, conflicts, starred counts).

- [ ] **Step 7: Verify `/austin/sxsw` filters to SXSW-tagged events**

In the same dev session, navigate to `http://localhost:5173/austin/sxsw`. Expected: only events tagged `sxsw` appear in Discover. Map shows only those pins. Schedule lists only those events. Conflict detection only considers those events.

Sanity check: if `/austin` shows ~800 events and `/austin/sxsw` shows ~300, the filter is working. (Exact counts depend on your data.)

- [ ] **Step 8: Verify `/austin/tech-week` filters to tech-week events**

Navigate to `http://localhost:5173/austin/tech-week`. Expected: only events tagged `tech-week` appear.

- [ ] **Step 9: Verify `/` triggers smart entry on a fresh session**

Open DevTools → Application → Storage → clear `localStorage`. Then open `http://localhost:5173/`. Expected: no `localStorage.lastCity`, no geolocation permission → the page navigates briefly through `/` then renders the landing placeholder (or stays at `/`). Since the landing component is added in Task 10, the page may render empty at this step; that's expected. Once it falls through to landing, you should see whatever `renderLanding` renders (added next).

NOTE: If the page errors because `./landing/landing` doesn't exist yet, this step will fail. That's intentional — Task 10 creates the landing module. To temporarily make this step pass standalone, you can add a stub: `mkdir -p src/landing && echo 'export function renderLanding(el: HTMLElement) { el.innerHTML = "<h1>Landing (stub)</h1>"; }' > src/landing/landing.ts`. Remove the stub when Task 10 lands or let Task 10 overwrite it.

Stop the dev server.

- [ ] **Step 10: Commit**

```bash
git add src/main.ts src/landing/landing.ts index.html src/views/
git commit -m "feat: wire main.ts to client-side router"
```

---

## Task 9: Update `views/map.ts` to read map center from the city config

**Files:**
- Modify: `src/views/map.ts`

- [ ] **Step 1: Make map center city-driven**

In `src/views/map.ts`, find the line:

```ts
map = L.map('map-container').setView([30.2672, -97.7431], 14);
```

Replace with:

```ts
import { getState } from '../state';
// ... (existing imports)

// inside createMap:
const cityState = getState();
const center = cityState.city?.map.center ?? [30.2672, -97.7431];
const zoom = cityState.city?.map.zoom ?? 14;
map = L.map('map-container').setView(center, zoom);
```

If `getState` is already imported, don't duplicate the import.

- [ ] **Step 2: Make `VENUE_COORDS` city-driven**

Currently `src/views/map.ts` imports `VENUE_COORDS` directly from `'../cities/austin/coordinates'`. That hard-codes Austin into the map view.

Replace the static import with a module-level cache populated on first render from the active city's `loadCoordinates()`:

```ts
// At top of file, remove:
//   import { VENUE_COORDS } from '../cities/austin/coordinates';

// Replace with a module-level cache:
let venueCoords: Record<string, [number, number]> = {};
let venueCoordsCityKey: string | null = null;

async function ensureCoords(): Promise<Record<string, [number, number]>> {
  const city = getState().city;
  if (!city) return {};
  if (venueCoordsCityKey === city.slug) return venueCoords;
  venueCoords = await city.loadCoordinates();
  venueCoordsCityKey = city.slug;
  return venueCoords;
}
```

Find every `VENUE_COORDS[...]` reference in the file and replace with `venueCoords[...]` (the cache). Before the function that builds markers runs, await `ensureCoords()`. If `renderMap` is currently synchronous, make it `async` and await `ensureCoords()` at the top:

```ts
export async function renderMap(container: HTMLElement) {
  await ensureCoords();
  // ... rest of existing renderMap body, with VENUE_COORDS replaced by venueCoords
}
```

Check `src/main.ts` — it calls `renderMap(content)` synchronously. Now that `renderMap` returns a Promise, that's fine for fire-and-forget rendering, but if you want strict ordering, you can `void renderMap(content)` or chain `.catch(console.error)`. Either is acceptable; pick fire-and-forget for parity with the old behavior.

- [ ] **Step 3: Verify the map works on `/austin`**

Run:

```bash
npm run dev
```

Open `http://localhost:5173/austin`, click the Map tab. Expected: map loads centered on Austin (30.2672, -97.7431), zoom 14. Markers appear for venues with coords.

- [ ] **Step 4: Commit**

```bash
git add src/views/map.ts
git commit -m "refactor: map view reads center and coords from active city config"
```

---

## Task 10: Add the landing page

**Files:**
- Create: `src/landing/landing.ts`

- [ ] **Step 1: Create `src/landing/landing.ts`**

```ts
import { listCities } from '../cities';
import { navigate } from '../routing/router';

export function renderLanding(container: HTMLElement) {
  const cities = listCities();

  container.innerHTML = `
    <div class="landing">
      <div class="landing-hero">
        <h1>Find events worth your time.</h1>
        <p class="landing-sub">Curated launches across every city we cover. Pick yours.</p>
      </div>
      <div class="landing-grid">
        ${cities.map(c => `
          <button class="landing-tile" data-city="${c.slug}">
            <span class="landing-tile-name">${c.name}</span>
            <span class="landing-tile-meta">${c.launches.length} launch${c.launches.length === 1 ? '' : 'es'}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll<HTMLButtonElement>('.landing-tile').forEach(btn => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-city');
      if (slug) navigate(`/${slug}`);
    });
  });
}
```

- [ ] **Step 2: Add minimal landing styles to `src/style.css`**

Append:

```css
/* Landing page */
.landing { max-width: 720px; margin: 80px auto; padding: 24px; }
.landing-hero { text-align: center; margin-bottom: 48px; }
.landing-hero h1 { font-size: 36px; color: var(--color-text, #e0e0e0); margin-bottom: 12px; }
.landing-sub { color: var(--color-text-muted, #888); font-size: 16px; }
.landing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.landing-tile {
  background: var(--color-surface, #1a1a1a);
  border: 1px solid var(--color-border, #333);
  border-radius: 12px;
  padding: 24px;
  color: var(--color-text, #e0e0e0);
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.15s;
}
.landing-tile:hover { border-color: var(--color-primary, #4ade80); }
.landing-tile-name { font-size: 20px; font-weight: 600; }
.landing-tile-meta { font-size: 13px; color: var(--color-text-muted, #888); }
```

- [ ] **Step 3: Verify the landing page renders at `/`**

Run:

```bash
npm run dev
```

Clear `localStorage` in DevTools, then open `http://localhost:5173/`. Expected: landing page with one tile for Austin. Click the Austin tile → navigates to `/austin`. Refresh `/` → since `lastCity` is now set, smart entry redirects back to `/austin`.

To re-test landing: clear `localStorage` again.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/landing/landing.ts src/style.css
git commit -m "feat: add landing page with city tiles"
```

---

## Task 11: Add NYC skeleton

**Files:**
- Create: `src/cities/nyc/config.ts`
- Create: `src/cities/nyc/events.ts`
- Create: `src/cities/nyc/coordinates.ts`
- Modify: `src/cities/index.ts`

- [ ] **Step 1: Create `src/cities/nyc/events.ts`**

```ts
import { CityEvent } from '../../data/types';

export function loadEvents(): CityEvent[] {
  return [];
}
```

- [ ] **Step 2: Create `src/cities/nyc/coordinates.ts`**

```ts
export const VENUE_COORDS: Record<string, [number, number]> = {};
```

- [ ] **Step 3: Create `src/cities/nyc/config.ts`**

```ts
import { CityConfig } from '../../data/types';

export const nycConfig: CityConfig = {
  slug: 'nyc',
  name: 'New York',
  theme: {
    '--color-bg': '#0a0a0f',
    '--color-surface': '#15151c',
    '--color-border': '#2a2a35',
    '--color-text': '#e8e8f0',
    '--color-text-muted': '#8a8a95',
    '--color-text-faint': '#55555f',
    '--color-primary': '#f59e0b',     // amber — placeholder, user to refine
    '--color-accent': '#ef4444',
  },
  map: {
    center: [40.7589, -73.9851],     // Times Square — picked as a neutral midtown anchor
    zoom: 13,
  },
  launches: [
    // No NYC launches yet — perpetual /nyc only.
  ],
  loadEvents: () => import('./events').then(m => m.loadEvents()),
  loadCoordinates: () => import('./coordinates').then(m => m.VENUE_COORDS),
};
```

- [ ] **Step 4: Register NYC in `src/cities/index.ts`**

```ts
import { CityConfig } from '../data/types';
import { austinConfig } from './austin/config';
import { nycConfig } from './nyc/config';

export const CITIES: Record<string, CityConfig> = {
  austin: austinConfig,
  nyc: nycConfig,
};

// (getCity and listCities unchanged)
export function getCity(slug: string): CityConfig | null {
  return CITIES[slug] ?? null;
}

export function listCities(): CityConfig[] {
  return Object.values(CITIES);
}
```

- [ ] **Step 5: Add an empty-state to Discover when zero events match**

In `src/views/discover.ts`, locate the existing empty-state block:

```ts
if (dayEvents.length === 0) {
  container.innerHTML = '<div class="empty-state">No events match the current filter.</div>';
  return;
}
```

Add a check before the day-filter for the all-events-empty case (e.g. NYC has no events at all yet). Update the existing destructuring at the top of `renderDiscover` to include `city`:

```ts
// Before
const { events, starred, currentDay, filters, conflicts } = getState();

// After
const { events, starred, currentDay, filters, conflicts, city } = getState();

if (events.length === 0) {
  container.innerHTML = `
    <div class="empty-state">
      <h2>Coming soon to ${city?.name ?? 'this city'}.</h2>
      <p>We're building out the event list. Check back soon.</p>
    </div>`;
  return;
}
```

`city` is now a typed field on the state (added in Task 7), so no `as any` is needed.

- [ ] **Step 6: Verify `/nyc` renders the empty state**

Run:

```bash
npm run dev
```

Open `http://localhost:5173/nyc`. Expected: NYC theme applied (different background/accent color), "Coming soon to New York." empty state.

Open `http://localhost:5173/`, clear `localStorage`, refresh. Expected: landing page now shows two tiles — Austin and New York.

Click NYC tile → navigates to `/nyc`. Click Austin tile (from another fresh session) → navigates to `/austin`.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/cities/nyc/ src/cities/index.ts src/views/discover.ts
git commit -m "feat: add NYC skeleton with empty state"
```

---

## Task 12: CSS variable refactor

**Files:**
- Modify: `src/style.css`

This task is mechanical. The goal: every hard-coded color that belongs to the city theme moves to a `var(--color-*)` reference with the existing hex as fallback.

- [ ] **Step 1: Define theme variables at `:root`**

At the very top of `src/style.css` (after the `@import 'leaflet/dist/leaflet.css';` line), add:

```css
:root {
  --color-bg: #0f0f0f;
  --color-surface: #1a1a1a;
  --color-border: #333333;
  --color-text: #e0e0e0;
  --color-text-muted: #888888;
  --color-text-faint: #555555;
  --color-primary: #4ade80;
  --color-accent: #22d3ee;
}
```

These match Austin's theme. They're the fallback for when no city is active (landing page).

- [ ] **Step 2: Replace hardcoded values throughout the file**

For each occurrence:

| Hardcoded | Replace with |
|-----------|--------------|
| `#0f0f0f` (background) | `var(--color-bg)` |
| `#1a1a1a` (surface, header bg, paywall bg) | `var(--color-surface)` |
| `#333` / `#2a2a2a` (borders) | `var(--color-border)` |
| `#e0e0e0` (body text) | `var(--color-text)` |
| `#888` / `#888888` (muted text) | `var(--color-text-muted)` |
| `#555` / `#555555` (faint text) | `var(--color-text-faint)` |
| `#4ade80` (green accent — stars, primary buttons, glow) | `var(--color-primary)` |
| `#22d3ee` (cyan accent in gradients) | `var(--color-accent)` |

Do NOT replace:
- `#000` / `#fff` — true black/white used as contrast colors against the theme accent (e.g. text on the green banner).
- Any color inside a `@keyframes` shadow that needs to match `--color-primary` literally; use `var(--color-primary)` there too, but verify the animation still renders.

Use:

```bash
grep -n '#4ade80\|#22d3ee\|#0f0f0f\|#1a1a1a\|#e0e0e0\|#888\|#555\|#333\|#2a2a2a' src/style.css
```

to find every instance. Step through them line by line.

- [ ] **Step 3: Verify Austin looks identical**

Run:

```bash
npm run dev
```

Open `http://localhost:5173/austin`. Expected: visually indistinguishable from before. Side-by-side compare with a git stash of the pre-refactor style if needed.

- [ ] **Step 4: Verify NYC has a distinct theme**

Open `http://localhost:5173/nyc`. Expected: NYC's amber primary color replaces green throughout — buttons, hover states, stars, badges all amber/red. Background slightly cooler.

- [ ] **Step 5: Verify `/` (landing) uses the default theme**

Open `http://localhost:5173/`, clear `localStorage`. Expected: landing page renders with the default (Austin-like) palette since no city theme has been applied. This is the documented behavior — the `:root` defaults match Austin.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/style.css
git commit -m "refactor: replace hardcoded theme colors with CSS custom properties"
```

---

## Task 13: Add `vercel.json` SPA rewrite

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json` at the repo root**

```json
{
  "rewrites": [
    { "source": "/((?!assets|favicon\\.ico|og-image\\.html|robots\\.txt).*)", "destination": "/index.html" }
  ]
}
```

This sends every path that isn't a static asset to `index.html`, so the client-side router can handle `/austin`, `/austin/sxsw`, `/nyc`, etc. on direct navigation and refresh.

- [ ] **Step 2: Verify the build still works**

Run:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173/austin` directly (not via navigation from `/`). Expected: the route loads correctly. Refresh on `/austin/sxsw`. Expected: same — no 404.

Note: `vite preview` honors a simpler rewrite story than Vercel's; the real validation happens on Vercel deploy. If `npm run preview` 404s on direct navigation but `npm run dev` works, that's a known `vite preview` limitation and is fine — the Vercel rewrite handles production.

Stop the preview server.

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "ops: add SPA rewrite for client-side city routes"
```

---

## Task 14: Final end-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Fresh-session walkthrough**

Run:

```bash
npm run dev
```

In a browser with cleared `localStorage`:

1. Open `/` → landing page shows Austin and NYC tiles. Click Austin.
2. Land on `/austin` → Austin theme, all Austin events visible. Star a couple.
3. Navigate to `/austin/sxsw` (manually type the URL) → only SXSW-tagged events. Stars from step 2 persist if those events are in the filtered set.
4. Navigate to `/austin/tech-week` → only tech-week events.
5. Navigate to `/austin/bogus-launch` → forgives unknown launch, shows perpetual `/austin` view.
6. Navigate to `/bogus-city` → lands on landing page (unknown-city error).
7. Open `/nyc` → NYC theme (amber), "Coming soon" empty state.
8. Star something on `/austin`, then visit `/nyc`, then return to `/austin`. Expected: Austin starred events restored (per-city localStorage key).
9. Reload at `/austin/sxsw`. Expected: page loads directly into the SXSW-filtered view, no flash of unfiltered content.
10. Click around between Discover / Map / Resolve / Schedule on `/austin/sxsw`. Expected: every view respects the launch filter (only SXSW events, only SXSW conflicts, only SXSW map pins).

- [ ] **Step 2: Build + production preview walkthrough**

Run:

```bash
npm run build
npm run preview
```

Repeat the key checks from Step 1 against the production build:

1. `/`, `/austin`, `/austin/sxsw`, `/nyc` all render.
2. Bundle inspection (DevTools → Network → JS): when visiting `/nyc`, the Austin events chunk (`austin/events`) should NOT be downloaded. Confirm by filtering Network for "events" — you should see only the NYC chunk.

If Austin's chunk is downloaded on `/nyc`, the dynamic import was inlined by Vite. Check that `import('./events')` in `cities/austin/config.ts` is genuinely dynamic and not eagerly imported anywhere.

Stop the preview server.

- [ ] **Step 3: Commit any final fixes from this verification pass**

If anything needed adjusting, commit those changes:

```bash
git add -A
git commit -m "fix: verification pass adjustments"
```

If nothing needed adjusting, skip this step.

---

## Out of scope (deliberately not in this plan)

- Repo + package rename (target TBD — user decides separately).
- Per-city OG images.
- Geolocation prompt in map view.
- Adding a test suite (separate plan if/when justified).
- Backfilling actual NYC events (this plan ships an empty NYC skeleton).
- "Advertise your event" landing-page split.
- Yearly archival (`/austin/sxsw-2026` vs `sxsw-2027`).

---

## Spec coverage check

Mapping spec sections to tasks (self-review):

| Spec section | Implementing task(s) |
|---|---|
| Concept model (City / Launch) | Tasks 2, 4 |
| URL structure | Task 6 (router), Task 13 (Vercel) |
| Approach (runtime city loader) | Tasks 4, 6, 8 |
| File layout | Tasks 3, 4, 6, 10, 11 |
| Types (CityEvent + configs) | Tasks 1, 2 |
| Routing + smart entry | Tasks 6, 8 |
| State + filtering (`getActiveEvents`) | Task 7 |
| Conflict scope (active launch) | Task 7 |
| Theming via CSS variables | Tasks 6 (apply), 12 (refactor) |
| Per-city map | Task 9 |
| Landing page | Task 10 |
| SEO + meta | Task 6 (`setDocumentMeta`), Task 8 (wiring) |
| Bundle splitting via dynamic import | Tasks 4, 11 (verified in Task 14) |
| Migration of existing data | Tasks 3, 5 |
| Repo rename | Out of scope (TBD) |
| Manual verification | Task 14 |

All spec sections accounted for.
