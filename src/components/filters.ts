import { getState, setDay, setFilter, starAll, clearStars } from '../state';
import { dayKey } from '../utils/time';

const DAYS = [
  { key: '2026-03-10', label: 'Tue 10' },
  { key: '2026-03-11', label: 'Wed 11' },
  { key: '2026-03-12', label: 'Thu 12' },
  { key: '2026-03-13', label: 'Fri 13' },
  { key: '2026-03-14', label: 'Sat 14' },
  { key: '2026-03-15', label: 'Sun 15' },
  { key: '2026-03-16', label: 'Mon 16' },
  { key: '2026-03-17', label: 'Tue 17' },
  { key: '2026-03-18', label: 'Wed 18' },
  { key: '2026-03-19', label: 'Thu 19' },
  { key: '2026-03-20', label: 'Fri 20' },
  { key: '2026-03-21', label: 'Sat 21' },
  { key: '2026-03-22', label: 'Sun 22' },
  { key: '2026-03-23', label: 'Mon 23' },
  { key: '2026-03-24', label: 'Tue 24' },
  { key: '2026-03-25', label: 'Wed 25' },
  { key: '2026-03-26', label: 'Thu 26' },
  { key: '2026-03-27', label: 'Fri 27' },
  { key: '2026-03-28', label: 'Sat 28' },
  { key: '2026-03-29', label: 'Sun 29' },
  { key: '2026-03-31', label: 'Tue 31' },
  { key: '2026-04-01', label: 'Wed Apr 1' },
  { key: '2026-04-04', label: 'Sat Apr 4' },
  { key: '2026-04-07', label: 'Tue Apr 7' },
  { key: '2026-04-10', label: 'Fri Apr 10' },
];

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'music', label: '\uD83C\uDFB5 Music' },
  { key: 'tech', label: 'Tech & Networking' },
];

export function renderFilters() {
  const { currentDay, filters, events } = getState();

  const dayFilters = document.getElementById('day-filters')!;
  // Count events per day (only events that haven't ended)
  const now = new Date();
  const dayCounts: Record<string, number> = {};
  for (const e of events) {
    if (e.end <= now) continue;
    const k = dayKey(e.start);
    dayCounts[k] = (dayCounts[k] || 0) + 1;
  }

  const today = dayKey(new Date());
  const visibleDays = DAYS.filter(d => d.key >= today);

  dayFilters.innerHTML = `
    <span class="filter-label">DAY:</span>
    ${visibleDays.map(d => `
      <button class="filter-btn ${currentDay === d.key ? 'active' : ''}" data-day="${d.key}">
        ${d.label}
        <span class="filter-count">${dayCounts[d.key] || 0}</span>
      </button>
    `).join('')}
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
    const { events, currentDay } = getState();
    const dayIndices = events.filter(e => dayKey(e.start) === currentDay).map(e => e.index);
    starAll(dayIndices);
  });

  document.getElementById('clear-day')?.addEventListener('click', () => {
    const { events, currentDay } = getState();
    const dayIndices = events.filter(e => dayKey(e.start) === currentDay).map(e => e.index);
    clearStars(dayIndices);
  });
}
