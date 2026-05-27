import { CityConfig } from '../data/types';
import { getCity, listCities } from '../cities';

export type Route =
  | { mode: 'landing'; error?: 'unknown-city' }
  | { mode: 'app'; city: CityConfig; launchSlug: string | null };

export function parsePath(pathname: string): Route {
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
  const last = localStorage.getItem('lastCity');
  if (last && getCity(last)) {
    return `/${last}`;
  }

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
