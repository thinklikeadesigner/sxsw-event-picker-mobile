import { defineConfig, type Plugin } from 'vite'
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

// Mirror of CityConfig data needed for static OG metadata. Keep in sync with
// src/cities/<city>/config.ts. Read at build time so per-route HTML files can
// be generated for crawler previews (iMessage / Slack / Twitter don't run JS).
const SITE_URL = 'https://sxswunofficial.com'

const CITIES: Record<string, {
  name: string
  title: string
  description: string
  launches: Record<string, { name: string; description: string }>
}> = {
  austin: {
    name: 'Austin',
    title: 'Wandr ATX — Austin Event Guide',
    description: 'Browse 500+ Austin events. Music, tech, networking, comedy. Filter by type, view on a map, build your schedule.',
    launches: {
      sxsw: {
        name: 'SXSW 2026',
        description: 'Music, film, tech & interactive — South by Southwest 2026.',
      },
      'tech-week': {
        name: 'Austin Tech Week',
        description: 'Curated tech, founder, and AI events across Austin.',
      },
    },
  },
  nyc: {
    name: 'New York',
    title: 'Wandr NYC — All the VIP lists. None of the lines.',
    description: 'Curated NYC tech events. Tech Week, founder dinners, VC mixers — all the VIP lists, none of the lines.',
    launches: {},
  },
  boston: {
    name: 'Boston',
    title: 'Wandr Boston — Boston Tech Week, mapped for builders.',
    description: 'AI, biotech, deep tech, and founder events across Boston. Boston Tech Week 2026 (May 26–31), mapped and filterable.',
    launches: {
      'tech-week': {
        name: 'Boston Tech Week 2026',
        description: 'AI, biotech, deep tech, and founder events across Boston (May 26–31).',
      },
    },
  },
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function rewriteMeta(
  html: string,
  {
    title,
    description,
    url,
    image,
  }: { title: string; description: string; url: string; image: string },
): string {
  let updated = html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${esc(description)}"`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${esc(title)}"`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${esc(description)}"`,
    )
    .replace(
      /<meta property="og:url" content="[^"]*"/,
      `<meta property="og:url" content="${esc(url)}"`,
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"/,
      `<meta name="twitter:title" content="${esc(title)}"`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"/,
      `<meta name="twitter:description" content="${esc(description)}"`,
    )

  // Inject og:image + twitter:image + twitter:card upgrade right before </head>.
  // index.html doesn't currently set these, so we add them rather than replace.
  const imageTags =
    `  <meta property="og:image" content="${esc(image)}">\n` +
    `  <meta property="og:image:width" content="1200">\n` +
    `  <meta property="og:image:height" content="630">\n` +
    `  <meta name="twitter:image" content="${esc(image)}">\n`
  // Bump twitter:card to summary_large_image so the generated 1200x630 OG image
  // is shown as a wide banner instead of the default small square thumbnail.
  updated = updated.replace(
    /<meta name="twitter:card" content="[^"]*"/,
    `<meta name="twitter:card" content="summary_large_image"`,
  )
  updated = updated.replace('</head>', `${imageTags}</head>`)
  return updated
}

function generatePerRouteHtml(): Plugin {
  return {
    name: 'generate-per-route-html',
    apply: 'build',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist')
      const indexPath = resolve(distDir, 'index.html')
      if (!existsSync(indexPath)) {
        console.warn('[generate-per-route-html] dist/index.html not found, skipping')
        return
      }
      const baseHtml = readFileSync(indexPath, 'utf-8')

      const writeRoute = (relPath: string, meta: { title: string; description: string; url: string }) => {
        const out = resolve(distDir, relPath)
        mkdirSync(dirname(out), { recursive: true })
        writeFileSync(out, rewriteMeta(baseHtml, meta))
      }

      for (const [citySlug, city] of Object.entries(CITIES)) {
        writeRoute(`${citySlug}/index.html`, {
          title: city.title,
          description: city.description,
          url: `${SITE_URL}/${citySlug}`,
          image: `${SITE_URL}/api/og?city=${citySlug}`,
        })

        for (const [launchSlug, launch] of Object.entries(city.launches)) {
          writeRoute(`${citySlug}/${launchSlug}/index.html`, {
            title: `${launch.name} — ${city.name} | Wandr`,
            description: launch.description,
            url: `${SITE_URL}/${citySlug}/${launchSlug}`,
            image: `${SITE_URL}/api/og?city=${citySlug}&launch=${launchSlug}`,
          })
        }
      }

      console.log('[generate-per-route-html] wrote per-city OG HTML files')
    },
  }
}

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/sxsw-event-picker/' : '/',
  plugins: [generatePerRouteHtml()],
})
