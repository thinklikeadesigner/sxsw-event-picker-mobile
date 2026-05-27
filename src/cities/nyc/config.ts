import { CityConfig } from '../../data/types';

export const nycConfig: CityConfig = {
  slug: 'nyc',
  name: 'New York',
  header: {
    title: 'Wandr NYC',
    subtitle: 'All the VIP lists. None of the lines.',
  },
  theme: {
    '--color-bg': '#0a0a0f',
    '--color-surface': '#15151c',
    '--color-border': '#2a2a35',
    '--color-text': '#e8e8f0',
    '--color-text-muted': '#8a8a95',
    '--color-text-faint': '#55555f',
    '--color-primary': '#f59e0b',
    '--color-accent': '#ef4444',
  },
  map: {
    center: [40.7589, -73.9851],
    zoom: 13,
  },
  launches: [],
  loadEvents: () => import('./events').then(m => m.loadEvents()),
  loadCoordinates: () => import('./coordinates').then(m => m.VENUE_COORDS),
};
