import { CityConfig } from '../../data/types';

export const bostonConfig: CityConfig = {
  slug: 'boston',
  name: 'Boston',
  header: {
    title: 'Wandr Boston',
    subtitle: 'Boston Tech Week, mapped for builders.',
  },
  theme: {
    '--color-bg': '#0c0f14',
    '--color-surface': '#161b22',
    '--color-border': '#2a3340',
    '--color-text': '#e6ebf2',
    '--color-text-muted': '#8b95a6',
    '--color-text-faint': '#525d72',
    '--color-primary': '#dc2626',
    '--color-accent': '#fbbf24',
  },
  map: {
    center: [42.3551, -71.0656],
    zoom: 13,
  },
  launches: [],
  loadEvents: () => import('./events').then(m => m.loadEvents()),
  loadCoordinates: () => import('./coordinates').then(m => m.VENUE_COORDS),
};
