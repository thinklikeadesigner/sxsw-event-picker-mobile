import { CityEvent } from '../data/types';
import { fmt } from '../utils/time';
import { isEventLocked, isFreeSample, isMusicEvent } from '../paywall';

export function formatUrlLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    const labels: Record<string, string> = {
      'luma.com': 'Luma',
      'eventbrite.com': 'Eventbrite',
      'connectingtheamericas.com': 'Connecting the Americas',
      'events.inc.com': 'Inc.',
      'events.fastcompany.com': 'Fast Company',
      'posh.vip': 'Posh',
      'splashthat.com': 'Splash',
      'swoogo.com': 'Swoogo',
    };
    const match = Object.entries(labels).find(([domain]) => host.endsWith(domain));
    return `Event page: ${match ? match[1] : host}`;
  } catch {
    return url;
  }
}

export function renderEventCard(event: CityEvent, starred: boolean, conflictCount: number): string {
  if (isEventLocked(event)) {
    return renderLockedCard(event);
  }

  const isFree = isFreeSample(event);
  const isMusic = isMusicEvent(event);
  const musicClass = isMusic ? 'music-event' : '';
  const sampleBadge = isFree ? '<span class="pill pill-sample">FREE PREVIEW</span>' : '';
  const musicBadge = isMusic ? '<span class="pill pill-music">\uD83C\uDFB5 Live Music</span>' : '';

  return `
    <div class="event-card ${starred ? 'starred' : ''} ${conflictCount > 0 ? 'has-conflict' : ''} ${musicClass}"
         data-index="${event.index}">
      <div class="star-icon">${starred ? '\u2605' : '\u2606'}</div>
      <div class="event-name">${event.summary}</div>
      <div class="event-meta">
        <span class="pill pill-time">${fmt(event.start)} \u2013 ${fmt(event.end)}</span>
        ${event.cost ? `<span class="pill pill-cost">${event.cost}</span>` : ''}
        ${musicBadge}
        ${!isMusic && event.type ? `<span class="pill pill-type">${event.type}</span>` : ''}
        ${sampleBadge}
        ${conflictCount > 0 ? `<span class="pill pill-conflict">\u26A1 ${conflictCount} overlap${conflictCount > 1 ? 's' : ''}</span>` : ''}
      </div>
      ${event.location ? `<div class="event-location">\uD83D\uDCCD <a href="https://maps.google.com/?q=${encodeURIComponent(event.location)}" target="_blank">${event.location}</a></div>` : ''}
      ${event.url ? `<div class="event-url-row"><a class="event-url" href="${event.url}" target="_blank">${formatUrlLabel(event.url)}</a></div>` : ''}
      ${event.description ? `<div class="card-description">${event.description}</div>` : ''}
    </div>`;
}

function renderLockedCard(event: CityEvent): string {
  return `
    <div class="event-card locked-card" data-index="${event.index}">
      <div class="locked-icon">&#x1F512;</div>
      <div class="event-name locked-name">${event.summary}</div>
      <div class="event-meta">
        <span class="pill pill-locked">&#x1F3B5; Music Event</span>
        <span class="pill pill-locked-blur">&#x2588;&#x2588;:&#x2588;&#x2588; \u2013 &#x2588;&#x2588;:&#x2588;&#x2588;</span>
      </div>
      ${event.location ? `<div class="event-location locked-location">\uD83D\uDCCD ${event.location.split(',')[0]}</div>` : ''}
      <div class="locked-cta">Unlock to see details & RSVP link</div>
    </div>`;
}
