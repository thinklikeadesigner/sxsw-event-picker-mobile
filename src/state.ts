import { CityEvent, Conflict, ViewMode, Filters, CityConfig, LaunchConfig } from './data/types';
import { detectConflicts } from './data/conflicts';

const STORAGE_KEY_BASE = 'sxsw2026-v2';

interface AppState {
  city: CityConfig | null;
  launch: LaunchConfig | null;
  events: CityEvent[];
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
  filters: { cost: 'all', type: 'all', search: '', location: 'all', timeOfDay: 'all', track: 'all' },
  resolveIndex: 0,
};

let renderCallback: (() => void) | null = null;

export function onStateChange(cb: () => void) { renderCallback = cb; }
function notify() { renderCallback?.(); }

export function getState() { return state; }

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

export function clearFilters() {
  state.filters.type = 'all';
  state.filters.search = '';
  state.filters.location = 'all';
  state.filters.timeOfDay = 'all';
  state.filters.cost = 'all';
  state.filters.track = 'all';
  notify();
}

export function hasActiveFilters(): boolean {
  const f = state.filters;
  return f.type !== 'all' || f.timeOfDay !== 'all' || f.location !== 'all' || f.track !== 'all' || (f.search || '').trim() !== '';
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
