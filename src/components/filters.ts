import { getState, setDay, setFilter, starAll, clearStars, getActiveEvents } from '../state';
import { dayKey } from '../utils/time';

let weekOffset = 0;

function getPageDays(offset: number, events: { start: Date; end: Date }[]): { key: string; label: string }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  start.setDate(today.getDate() + offset * 7);

  const eventDays = new Set<string>();
  for (const e of events) {
    eventDays.add(dayKey(e.start));
  }

  const days: { key: string; label: string }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    if (eventDays.has(key)) {
      // Short label like "Wed" — date/month would just add visual noise on the
      // pill, the launch context already tells you which week we're in.
      days.push({ key, label: dayNames[d.getDay()] });
    }
  }
  return days;
}

function getPageLabel(offset: number): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  start.setDate(today.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (start.getMonth() === end.getMonth()) {
    return `${monthNames[start.getMonth()]} ${start.getDate()}–${end.getDate()}`;
  }
  return `${monthNames[start.getMonth()]} ${start.getDate()} – ${monthNames[end.getMonth()]} ${end.getDate()}`;
}

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'music', label: '🎵 Music' },
  { key: 'tech', label: 'Tech & Networking' },
  { key: 'wellness', label: '🧘 Wellness' },
];

const TIME_BUCKETS = [
  { key: 'all', label: 'All' },
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
];

// Pull the leading segment of "Back Bay, Boston, MA" → "Back Bay".
// Used both for the filter menu and to test events against the active filter.
export function locationKey(loc: string): string {
  return (loc || '').split(',')[0].trim();
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export function renderFilters() {
  const { currentDay, filters } = getState();
  const events = getActiveEvents();

  // --- Day filter row (existing) ---
  const dayFilters = document.getElementById('day-filters')!;
  const dayCounts: Record<string, number> = {};
  for (const e of events) {
    const k = dayKey(e.start);
    dayCounts[k] = (dayCounts[k] || 0) + 1;
  }

  const weekDays = getPageDays(weekOffset, events);
  const weekLabel = getPageLabel(weekOffset);

  dayFilters.innerHTML = `
    <div class="week-nav">
      <button class="week-nav-btn" id="prev-week">←</button>
      <span class="week-label">${weekOffset === 0 ? 'This Week' : weekLabel}</span>
      <button class="week-nav-btn" id="next-week">→</button>
    </div>
    <div class="week-days">
      <button class="filter-btn day-btn ${currentDay === 'all' ? 'active' : ''}" data-day="all">All</button>
      ${weekDays.map(d => `
        <button class="filter-btn day-btn ${currentDay === d.key ? 'active' : ''}" data-day="${d.key}">
          ${d.label}
        </button>
      `).join('') || '<span class="empty-week">No events this week</span>'}
    </div>
    <div class="filter-actions">
      <button class="filter-btn" id="star-day">Star Day</button>
      <button class="filter-btn" id="clear-day">Clear Day</button>
    </div>
  `;

  // --- Search input row ---
  // Render the input ONCE per render cycle (skip if already there) so typing
  // doesn't lose focus when state changes trigger re-renders.
  const searchEl = document.getElementById('search-filter')!;
  let searchInput = searchEl.querySelector<HTMLInputElement>('#search-input');
  if (!searchInput) {
    searchEl.innerHTML = `
      <label class="search-wrap">
        <span class="search-icon" aria-hidden="true">🔍</span>
        <input
          type="search"
          id="search-input"
          class="search-input"
          placeholder="Search events, hosts, venues..."
          value="${escapeAttr(filters.search)}"
          autocomplete="off"
          spellcheck="false"
        >
      </label>
    `;
    searchInput = searchEl.querySelector<HTMLInputElement>('#search-input')!;
    searchInput.addEventListener('input', (e) => {
      setFilter('search', (e.target as HTMLInputElement).value);
    });
  } else if (searchInput.value !== filters.search) {
    // Sync value if state was reset externally; don't disturb focus otherwise.
    searchInput.value = filters.search;
  }

  // --- Type row (existing) ---
  const costFilters = document.getElementById('cost-filters')!;
  costFilters.innerHTML = `
    <span class="filter-label">TYPE:</span>
    ${TYPES.map(t => `
      <button class="filter-btn ${filters.type === t.key ? 'active' : ''}" data-type="${t.key}">${t.label}</button>
    `).join('')}
  `;

  // --- Time-of-day row ---
  const timeFilters = document.getElementById('time-filters')!;
  timeFilters.innerHTML = `
    <span class="filter-label">TIME:</span>
    ${TIME_BUCKETS.map(t => `
      <button class="filter-btn ${filters.timeOfDay === t.key ? 'active' : ''}" data-time="${t.key}">${t.label}</button>
    `).join('')}
  `;

  // --- Location row ---
  // Derived from the leading segment of each event's location string.
  // Counts are computed against the active set; "all" is always present.
  const locationFilters = document.getElementById('location-filters')!;
  const locCounts: Record<string, number> = {};
  for (const e of events) {
    const k = locationKey(e.location);
    if (!k) continue;
    locCounts[k] = (locCounts[k] || 0) + 1;
  }
  const sortedLocations = Object.keys(locCounts).sort((a, b) => locCounts[b] - locCounts[a]);
  locationFilters.innerHTML = `
    <span class="filter-label">WHERE:</span>
    <button class="filter-btn ${filters.location === 'all' ? 'active' : ''}" data-location="all">All</button>
    ${sortedLocations.map(loc => `
      <button class="filter-btn ${filters.location === loc ? 'active' : ''}" data-location="${escapeAttr(loc)}">${loc} <span class="filter-count">${locCounts[loc]}</span></button>
    `).join('')}
  `;

  // --- Bindings ---
  document.getElementById('prev-week')?.addEventListener('click', () => {
    weekOffset--;
    renderFilters();
  });
  document.getElementById('next-week')?.addEventListener('click', () => {
    weekOffset++;
    renderFilters();
  });

  dayFilters.querySelectorAll('[data-day]').forEach(btn => {
    btn.addEventListener('click', () => setDay(btn.getAttribute('data-day')!));
  });

  costFilters.querySelectorAll('[data-type]').forEach(btn => {
    btn.addEventListener('click', () => setFilter('type', btn.getAttribute('data-type')!));
  });

  timeFilters.querySelectorAll('[data-time]').forEach(btn => {
    btn.addEventListener('click', () => setFilter('timeOfDay', btn.getAttribute('data-time')!));
  });

  locationFilters.querySelectorAll('[data-location]').forEach(btn => {
    btn.addEventListener('click', () => setFilter('location', btn.getAttribute('data-location')!));
  });

  document.getElementById('star-day')?.addEventListener('click', () => {
    const { currentDay } = getState();
    const dayIndices = getActiveEvents().filter(e => dayKey(e.start) === currentDay).map(e => e.index);
    starAll(dayIndices);
  });

  document.getElementById('clear-day')?.addEventListener('click', () => {
    const { currentDay } = getState();
    const dayIndices = getActiveEvents().filter(e => dayKey(e.start) === currentDay).map(e => e.index);
    clearStars(dayIndices);
  });
}
