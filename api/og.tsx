// Vercel Edge Function — generates 1200x630 OG images for link previews.
// Triggered via /api/og?city=<slug>&launch=<slug>. Vite ignores this file
// (api/ is not in tsconfig.include); Vercel picks it up at deploy.

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

type CityTheme = {
  bg: string;
  surface: string;
  primary: string;
  accent: string;
  wordmark: string;
  tagline: string;
};

const CITIES: Record<string, CityTheme> = {
  austin: {
    bg: '#0f0f0f',
    surface: '#1a1a1a',
    primary: '#4ade80',
    accent: '#22d3ee',
    wordmark: 'Wandr ATX',
    tagline: 'SXSW energy. Every week.',
  },
  nyc: {
    bg: '#0a0a0f',
    surface: '#15151c',
    primary: '#f59e0b',
    accent: '#ef4444',
    wordmark: 'Wandr NYC',
    tagline: 'All the VIP lists. None of the lines.',
  },
  boston: {
    bg: '#0c0f14',
    surface: '#161b22',
    primary: '#dc2626',
    accent: '#fbbf24',
    wordmark: 'Wandr Boston',
    tagline: 'Boston Tech Week, mapped for builders.',
  },
};

const LAUNCH_NAMES: Record<string, string> = {
  sxsw: 'SXSW 2026',
  'tech-week': 'Tech Week',
};

export default function handler(req: Request) {
  const url = new URL(req.url);
  const citySlug = (url.searchParams.get('city') || 'austin').toLowerCase();
  const launchSlug = url.searchParams.get('launch') || '';

  const theme = CITIES[citySlug] ?? CITIES.austin;
  const launchLabel = launchSlug ? LAUNCH_NAMES[launchSlug] ?? launchSlug : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: theme.bg,
          color: '#e8e8e8',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          position: 'relative',
        }}
      >
        {/* Accent gradient bar at the top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
            display: 'flex',
          }}
        />

        {/* Top: wordmark + optional launch badge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              color: theme.primary,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {theme.wordmark}
          </div>
          {launchLabel ? (
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                padding: '12px 24px',
                background: theme.surface,
                border: `2px solid ${theme.accent}`,
                borderRadius: 999,
                color: theme.accent,
                fontSize: 32,
                fontWeight: 600,
              }}
            >
              {launchLabel}
            </div>
          ) : null}
        </div>

        {/* Bottom: tagline + brand line */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              fontSize: 48,
              color: '#e8e8e8',
              lineHeight: 1.2,
              maxWidth: 1040,
            }}
          >
            {theme.tagline}
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#888',
              display: 'flex',
            }}
          >
            sxswunofficial.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
