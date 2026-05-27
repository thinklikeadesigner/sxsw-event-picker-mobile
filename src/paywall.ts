import { CityEvent } from './data/types';

// --- Configuration ---
// Set to true to enable the music paywall, false to show all events free
export const PAYWALL_ENABLED = false;
// Replace with your Stripe Payment Link URL
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/14AdR17msfhq0RHbdfbV601';

// Free sample events — shown unlocked to hook users
const FREE_SAMPLE_UIDS = new Set([
  'sxsw-2026-0366-the-lumineers@manual',
  'sxsw-2026-0354-orville-peck-concert@manual',
  'sxsw-2026-0361-community-concerts-tune-yards@manual',
  'sxsw-2026-0295-south-by-san-jose-thu@manual',
  'sxsw-2026-0296-south-by-san-jose-fri@manual',
]);

const UNLOCK_KEY = 'sxsw2026-music';

// --- Core logic ---

export function isMusicEvent(event: CityEvent): boolean {
  return event.type === 'Music + Live Show';
}

export function isMusicUnlocked(): boolean {
  return localStorage.getItem(UNLOCK_KEY) === 'unlocked';
}

export function unlockMusic() {
  localStorage.setItem(UNLOCK_KEY, 'unlocked');
}

export function isFreeSample(event: CityEvent): boolean {
  return FREE_SAMPLE_UIDS.has(event.uid);
}

export function isEventLocked(event: CityEvent): boolean {
  if (!PAYWALL_ENABLED) return false;
  if (!isMusicEvent(event)) return false;
  if (isMusicUnlocked()) return false;
  if (isFreeSample(event)) return false;
  return true;
}

/** Check URL params on page load for Stripe success redirect */
export function checkUnlockFromUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.get('unlock') === 'success') {
    unlockMusic();
    // Clean the URL
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  }
  return false;
}

/** Count of locked music events for a given day */
export function countLockedMusic(events: CityEvent[], dayKeyFn: (d: Date) => string, day: string): number {
  const now = new Date();
  return events.filter(e =>
    isMusicEvent(e) && !isFreeSample(e) && dayKeyFn(e.start) === day && e.end > now
  ).length;
}

/** Total music events remaining */
export function countTotalMusic(events: CityEvent[]): number {
  const now = new Date();
  return events.filter(e => isMusicEvent(e) && e.end > now).length;
}
