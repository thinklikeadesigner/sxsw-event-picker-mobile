import { getState, toggleStar, getActiveEvents } from '../state';
import { renderEventCard } from '../components/event-card';
import { locationKey, matchesTrack } from '../components/filters';
import { dayKey, dayLabel, fmt } from '../utils/time';
import { PAYWALL_ENABLED, isMusicUnlocked, countLockedMusic, countTotalMusic, STRIPE_PAYMENT_LINK } from '../paywall';

function matchesTimeOfDay(event: { start: Date }, bucket: string): boolean {
  if (bucket === 'all') return true;
  const h = event.start.getHours();
  if (bucket === 'morning') return h < 12;
  if (bucket === 'afternoon') return h >= 12 && h < 17;
  if (bucket === 'evening') return h >= 17;
  return true;
}

function matchesSearch(event: { summary: string; description: string; location: string }, q: string): boolean {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    event.summary.toLowerCase().includes(needle) ||
    event.description.toLowerCase().includes(needle) ||
    event.location.toLowerCase().includes(needle)
  );
}

const WELLNESS_TYPES = new Set([
  'Relax + Networking',
  'Sport + Networking',
  'Health + Event + Networking',
]);

const WELLNESS_KEYWORDS = /wellness|yoga|meditat|fitness|breathwork|mindful|sound bath|pilates|recovery|restore|recharge/i;

function isWellnessEvent(event: { type: string; summary: string; description: string }): boolean {
  return WELLNESS_TYPES.has(event.type) ||
    WELLNESS_KEYWORDS.test(event.summary) ||
    WELLNESS_KEYWORDS.test(event.description);
}

function matchesTypeFilter(event: { type: string; summary: string; description: string }, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'music') return event.type === 'Music + Live Show';
  if (filter === 'wellness') return isWellnessEvent(event);
  if (filter === 'tech') return event.type !== 'Music + Live Show' && !isWellnessEvent(event);
  return true;
}

export function renderDiscover(container: HTMLElement) {
  const { starred, currentDay, filters, conflicts, city } = getState();
  const events = getActiveEvents();

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Coming soon to ${city?.name ?? 'this city'}.</h2>
        <p>We're building out the event list. Check back soon.</p>
      </div>`;
    return;
  }

  // Filter events for current day + type + search + location + time-of-day.
  // Past events stay visible — users browse the full day, not just upcoming.
  // currentDay === 'all' bypasses the day check (shows every day's events).
  const dayEvents = events.filter(e =>
    (currentDay === 'all' || dayKey(e.start) === currentDay)
    && matchesTypeFilter(e, filters.type)
    && matchesSearch(e, filters.search)
    && matchesTimeOfDay(e, filters.timeOfDay)
    && (filters.location === 'all' || locationKey(e.location) === filters.location)
    && matchesTrack(e, filters.track)
  );

  if (dayEvents.length === 0) {
    container.innerHTML = '<div class="empty-state">No events match the current filter.</div>';
    return;
  }

  // Count conflicts per event (among starred events)
  const conflictCounts: Record<number, number> = {};
  for (const c of conflicts) {
    if (!c.resolved) {
      conflictCounts[c.eventA] = (conflictCounts[c.eventA] || 0) + 1;
      conflictCounts[c.eventB] = (conflictCounts[c.eventB] || 0) + 1;
    }
  }

  const timeToMin = (t: string): number => {
    const m = t.match(/(\d+):(\d+) (AM|PM)/);
    if (!m) return 0;
    let h = +m[1];
    if (m[3] === 'PM' && h !== 12) h += 12;
    if (m[3] === 'AM' && h === 12) h = 0;
    return h * 60 + (+m[2]);
  };

  // Group events by day. Single-day mode = one group; 'all' mode = many.
  const byDay: Record<string, typeof dayEvents> = {};
  for (const e of dayEvents) {
    const k = dayKey(e.start);
    if (!byDay[k]) byDay[k] = [];
    byDay[k].push(e);
  }
  const sortedDayKeys = Object.keys(byDay).sort();

  // Paywall banner (computed once, shown at top regardless of day mode)
  const musicUnlocked = isMusicUnlocked();
  // For paywall counts, fall back to the first visible day when in 'all' mode
  // so the helper functions (which expect a single day key) don't barf.
  const paywallDayKey = currentDay === 'all' ? sortedDayKeys[0] : currentDay;
  const lockedCount = countLockedMusic(events, dayKey, paywallDayKey);
  const totalMusic = countTotalMusic(events);
  let paywallHtml = '';
  if (PAYWALL_ENABLED && !musicUnlocked && lockedCount > 0) {
    paywallHtml = `
      <div class="paywall-banner" id="paywall-banner">
        <div class="paywall-content">
          <div class="paywall-icon">&#x1F3B5;</div>
          <div class="paywall-text">
            <div class="paywall-title">${lockedCount} music events today &middot; ${totalMusic} total</div>
            <div class="paywall-subtitle">Free shows, secret headliners, day parties &mdash; unlock them all</div>
          </div>
        </div>
        <div class="paywall-actions">
          <a href="${STRIPE_PAYMENT_LINK}" class="paywall-btn paywall-buy" target="_blank">Unlock All &mdash; $9</a>
        </div>
      </div>`;
  }

  let html = paywallHtml;

  for (const dKey of sortedDayKeys) {
    const dayEvts = byDay[dKey];
    // Group this day's events by start time
    const byTime: Record<string, typeof dayEvents> = {};
    for (const e of dayEvts) {
      const key = fmt(e.start);
      if (!byTime[key]) byTime[key] = [];
      byTime[key].push(e);
    }
    const sortedTimes = Object.keys(byTime).sort((a, b) => timeToMin(a) - timeToMin(b));

    const d = dayEvts[0].start;
    const starredInDay = dayEvts.filter(e => starred.has(e.index)).length;
    const conflictsInDay = dayEvts.filter(e => conflictCounts[e.index]).length;

    html += `
      <div class="day-header">
        ${dayLabel(d)}
        <span class="day-badge">${dayEvts.length} events</span>
        <span class="day-badge starred-badge">${starredInDay} starred</span>
        ${conflictsInDay > 0 ? `<span class="day-badge conflict-badge">\u26A1 ${conflictsInDay} conflicts</span>` : ''}
      </div>`;

    for (const time of sortedTimes) {
      html += `
        <div class="time-slot">
          <div class="time-label">${time}</div>
          <div class="events-row">
            ${byTime[time].map(e => renderEventCard(e, starred.has(e.index), conflictCounts[e.index] || 0)).join('')}
          </div>
        </div>`;
    }
  }

  container.innerHTML = html;

  // Bind click handlers (skip locked cards)
  container.querySelectorAll('.event-card:not(.locked-card)').forEach(card => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).tagName === 'A') return;

      // On mobile: tap star icon to star, tap card to expand
      const isMobile = window.innerWidth <= 768;
      const tappedStar = (e.target as HTMLElement).closest('.star-icon');

      if (tappedStar || !isMobile) {
        const index = parseInt(card.getAttribute('data-index')!);
        toggleStar(index);
      } else {
        card.classList.toggle('expanded');
      }
    });
  });

  // Add "Now" button if viewing today
  const today = new Date();
  const todayKey = dayKey(today);
  if (currentDay === todayKey) {
    const nowBtn = document.createElement('button');
    nowBtn.className = 'now-btn';
    nowBtn.textContent = '\u25CF Now';
    nowBtn.addEventListener('click', () => {
      const now2 = new Date();
      const currentHour = now2.getHours();
      const currentMin = now2.getMinutes();
      const ampm = currentHour >= 12 ? 'PM' : 'AM';
      const hr = currentHour % 12 || 12;
      const timeStr = `${hr}:${currentMin < 30 ? '00' : '30'} ${ampm}`;
      // Find the closest time slot
      const slots = container.querySelectorAll('.time-label');
      let closest: Element | null = null;
      for (const slot of slots) {
        closest = slot;
        if (slot.textContent?.trim() === timeStr) break;
      }
      closest?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    container.prepend(nowBtn);
  }
}
