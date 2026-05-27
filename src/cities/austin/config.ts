import { CityConfig } from '../../data/types';

export const austinConfig: CityConfig = {
  slug: 'austin',
  name: 'Austin',
  header: {
    title: 'Wandr ATX',
    subtitle: 'SXSW energy. Every week.',
  },
  theme: {
    '--color-bg': '#0f0f0f',
    '--color-surface': '#1a1a1a',
    '--color-border': '#333333',
    '--color-text': '#e0e0e0',
    '--color-text-muted': '#888888',
    '--color-text-faint': '#555555',
    '--color-primary': '#4ade80',
    '--color-accent': '#22d3ee',
  },
  map: {
    center: [30.2672, -97.7431],
    zoom: 14,
  },
  launches: [
    {
      slug: 'sxsw',
      name: 'SXSW 2026',
      window: {
        start: new Date(2026, 2, 9),
        end:   new Date(2026, 2, 18),
      },
      description: 'Music, film, tech & interactive — South by Southwest 2026.',
    },
    {
      slug: 'tech-week',
      name: 'Austin Tech Week',
      window: {
        start: new Date(2026, 4, 4),
        end:   new Date(2026, 4, 11),
      },
      description: 'Curated tech, founder, and AI events across Austin.',
    },
  ],
  loadEvents: () => import('./events').then(m => m.loadEvents()),
  loadCoordinates: () => import('./coordinates').then(m => m.VENUE_COORDS),
};
