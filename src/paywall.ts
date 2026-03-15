import { SXSWEvent } from './data/types';

// --- Configuration ---
// Replace with your Stripe Payment Link URL
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/14AdR17msfhq0RHbdfbV601';

// Access codes for "already purchased" flow
// Add codes here that you distribute (VIP gets one, CREW gets another, etc.)
const ACCESS_CODES = new Set([
  'MUSIC2026',   // Fallback code included in Stripe receipt
  'VIPSXSW',     // Inner circle — 100% off on Stripe too
]);

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

export function isMusicEvent(event: SXSWEvent): boolean {
  return event.type === 'Music + Live Show';
}

export function isMusicUnlocked(): boolean {
  return localStorage.getItem(UNLOCK_KEY) === 'unlocked';
}

export function unlockMusic() {
  localStorage.setItem(UNLOCK_KEY, 'unlocked');
}

export function isFreeSample(event: SXSWEvent): boolean {
  return FREE_SAMPLE_UIDS.has(event.uid);
}

export function isEventLocked(event: SXSWEvent): boolean {
  if (!isMusicEvent(event)) return false;
  if (isMusicUnlocked()) return false;
  if (isFreeSample(event)) return false;
  return true;
}

export function validateAccessCode(code: string): boolean {
  return ACCESS_CODES.has(code.trim().toUpperCase());
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
export function countLockedMusic(events: SXSWEvent[], dayKeyFn: (d: Date) => string, day: string): number {
  const now = new Date();
  return events.filter(e =>
    isMusicEvent(e) && !isFreeSample(e) && dayKeyFn(e.start) === day && e.end > now
  ).length;
}

/** Total music events remaining */
export function countTotalMusic(events: SXSWEvent[]): number {
  const now = new Date();
  return events.filter(e => isMusicEvent(e) && e.end > now).length;
}
