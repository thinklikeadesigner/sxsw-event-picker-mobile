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
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    if (eventDays.has(key)) {
      days.push({ key, label: `${dayNames[d.getDay()]} ${monthNames[d.getMonth()]} ${d.getDate()}` });
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
    return `${monthNames[start.getMonth()]} ${start.getDate()}\u2013${end.getDate()}`;
  }
  return `${monthNames[start.getMonth()]} ${start.getDate()} \u2013 ${monthNames[end.getMonth()]} ${end.getDate()}`;
}

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'music', label: '\uD83C\uDFB5 Music' },
  { key: 'tech', label: 'Tech & Networking' },
  { key: 'wellness', label: '\uD83E\uDDD8 Wellness' },
];

export function renderFilters() {
  const { currentDay, filters } = getState();
  const events = getActiveEvents();

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
      <button class="week-nav-btn" id="prev-week">\u2190</button>
      <span class="week-label">${weekOffset === 0 ? 'This Week' : weekLabel}</span>
      <button class="week-nav-btn" id="next-week">\u2192</button>
    </div>
    <div class="week-days">
      ${weekDays.map(d => `
        <button class="filter-btn day-btn ${currentDay === d.key ? 'active' : ''}" data-day="${d.key}">
          ${d.label}
          <span class="filter-count">${dayCounts[d.key] || 0}</span>
        </button>
      `).join('') || '<span class="empty-week">No events this week</span>'}
    </div>
    <div class="filter-actions">
      <button class="filter-btn" id="star-day">Star Day</button>
      <button class="filter-btn" id="clear-day">Clear Day</button>
    </div>
  `;

  const costFilters = document.getElementById('cost-filters')!;
  costFilters.innerHTML = `
    <span class="filter-label">TYPE:</span>
    ${TYPES.map(t => `
      <button class="filter-btn ${filters.type === t.key ? 'active' : ''}" data-type="${t.key}">${t.label}</button>
    `).join('')}
  `;

  // Bind week nav
  document.getElementById('prev-week')?.addEventListener('click', () => {
    weekOffset--;
    renderFilters();
  });
  document.getElementById('next-week')?.addEventListener('click', () => {
    weekOffset++;
    renderFilters();
  });

  // Bind day buttons
  dayFilters.querySelectorAll('[data-day]').forEach(btn => {
    btn.addEventListener('click', () => setDay(btn.getAttribute('data-day')!));
  });

  // Bind type buttons
  costFilters.querySelectorAll('[data-type]').forEach(btn => {
    btn.addEventListener('click', () => setFilter('type', btn.getAttribute('data-type')!));
  });

  // Bind star/clear day
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
