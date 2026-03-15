import { getState, toggleStar } from '../state';
import { renderEventCard } from '../components/event-card';
import { dayKey, dayLabel, fmt } from '../utils/time';
import { isMusicUnlocked, countLockedMusic, countTotalMusic, STRIPE_PAYMENT_LINK, validateAccessCode, unlockMusic } from '../paywall';

function matchesCostFilter(cost: string, filter: string): boolean {
  if (filter === 'all') return true;
  const c = (cost || '').toLowerCase();
  if (filter === 'free') return c === 'free';
  if (filter === 'register') return c === 'register';
  if (filter === 'approval') return c.includes('approval');
  if (filter === 'request') return c.includes('request');
  if (filter === 'paid') return /\$/.test(cost);
  return true;
}

export function renderDiscover(container: HTMLElement) {
  const { events, starred, currentDay, filters, conflicts } = getState();

  // Filter events for current day, cost, and not ended
  const now = new Date();
  const dayEvents = events.filter(e =>
    dayKey(e.start) === currentDay && matchesCostFilter(e.cost, filters.cost) && e.end > now
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

  // Group by start time
  const byTime: Record<string, typeof dayEvents> = {};
  for (const e of dayEvents) {
    const key = fmt(e.start);
    if (!byTime[key]) byTime[key] = [];
    byTime[key].push(e);
  }

  const sortedTimes = Object.keys(byTime).sort((a, b) => {
    const toMin = (t: string) => {
      const m = t.match(/(\d+):(\d+) (AM|PM)/);
      if (!m) return 0;
      let h = +m[1];
      if (m[3] === 'PM' && h !== 12) h += 12;
      if (m[3] === 'AM' && h === 12) h = 0;
      return h * 60 + (+m[2]);
    };
    return toMin(a) - toMin(b);
  });

  const d = dayEvents[0].start;
  const starredInDay = dayEvents.filter(e => starred.has(e.index)).length;
  const conflictsInDay = dayEvents.filter(e => conflictCounts[e.index]).length;

  // Paywall banner
  const musicUnlocked = isMusicUnlocked();
  const lockedCount = countLockedMusic(events, dayKey, currentDay);
  const totalMusic = countTotalMusic(events);
  let paywallHtml = '';
  if (!musicUnlocked && lockedCount > 0) {
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
          <a href="${STRIPE_PAYMENT_LINK}" class="paywall-btn paywall-buy" target="_blank">Unlock All &mdash; <span class="price-old">$19</span> $9</a>
          <button class="paywall-btn paywall-code" id="paywall-code-btn">Have a code?</button>
        </div>
        <div class="paywall-code-form" id="paywall-code-form" style="display:none">
          <input type="text" id="paywall-code-input" placeholder="Enter access code" class="paywall-input" autocomplete="off" />
          <button class="paywall-btn paywall-submit" id="paywall-code-submit">Unlock</button>
          <div class="paywall-error" id="paywall-error" style="display:none">Invalid code</div>
        </div>
      </div>`;
  }

  let html = paywallHtml + `
    <div class="day-header">
      ${dayLabel(d)}
      <span class="day-badge">${dayEvents.length} events</span>
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

  // Paywall code toggle + submit
  document.getElementById('paywall-code-btn')?.addEventListener('click', () => {
    const form = document.getElementById('paywall-code-form')!;
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
  });
  document.getElementById('paywall-code-submit')?.addEventListener('click', () => {
    const input = document.getElementById('paywall-code-input') as HTMLInputElement;
    if (validateAccessCode(input.value)) {
      unlockMusic();
      // Re-render to show unlocked events
      renderDiscover(container);
    } else {
      document.getElementById('paywall-error')!.style.display = 'block';
    }
  });
  document.getElementById('paywall-code-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('paywall-code-submit')?.click();
  });

  // Add "Now" button if viewing today
  const today = new Date();
  const todayKey = dayKey(today);
  if (currentDay === todayKey) {
    const nowBtn = document.createElement('button');
    nowBtn.className = 'now-btn';
    nowBtn.textContent = '\u25CF Now';
    nowBtn.addEventListener('click', () => {
      const currentHour = today.getHours();
      const currentMin = today.getMinutes();
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
