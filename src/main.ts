import './style.css';
import { inject } from '@vercel/analytics';
import { initCity, onStateChange, getState, setView, setLaunch, resetCity, clearFilters, hasActiveFilters } from './state';
import { renderDiscover } from './views/discover';
import { renderResolve } from './views/resolve';
import { renderSchedule } from './views/schedule';
import { renderMap, destroyMap } from './views/map';
import { renderFilters } from './components/filters';
import { ViewMode } from './data/types';
import { checkUnlockFromUrl } from './paywall';
import { parsePath, applyTheme, setDocumentMeta, pickSmartEntry, navigate } from './routing/router';
import { renderLanding } from './landing/landing';

inject();

function updateActiveFilterDot() {
  const dot = document.getElementById('filter-active-dot');
  if (!dot) return;
  dot.hidden = !hasActiveFilters();
}

function closeFilterSheet() {
  document.body.classList.remove('sheet-open', 'search-open');
}
function openFilterSheet() {
  document.body.classList.remove('search-open');
  document.body.classList.add('sheet-open');
}
function openSearchSheet() {
  document.body.classList.remove('sheet-open');
  document.body.classList.add('search-open');
  // Focus the search input once the sheet is open
  setTimeout(() => {
    const el = document.getElementById('search-input') as HTMLInputElement | null;
    el?.focus();
  }, 80);
}

function updateBanner() {
  const messageEl = document.getElementById('banner-message');
  if (!messageEl) return;
  const state = getState();
  if (!state.city) {
    messageEl.textContent = 'Find this useful?';
    return;
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const active = state.city.launches.find(l => l.window && today >= l.window.start && today <= l.window.end);
  messageEl.textContent = active ? `${active.name} is live.` : 'Find this useful?';
}

function render() {
  const state = getState();
  const content = document.getElementById('content')!;
  const controls = document.getElementById('controls')!;
  const appShell = document.getElementById('app-shell');

  updateBanner();
  updateActiveFilterDot();

  if (!state.city) {
    if (appShell) appShell.style.display = 'none';
    renderLanding(content);
    return;
  }
  if (appShell) appShell.style.display = '';

  document.getElementById('starred-count')!.textContent = String(state.starred.size);
  const unresolvedCount = state.conflicts.filter(c => !c.resolved).length;
  document.getElementById('conflict-count')!.textContent = String(unresolvedCount);
  const badge = document.getElementById('resolve-badge')!;
  badge.textContent = String(unresolvedCount);
  badge.style.display = unresolvedCount > 0 ? '' : 'none';

  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-view') === state.currentView);
  });

  if (state.currentView !== 'map') destroyMap();

  document.body.classList.toggle('view-map', state.currentView === 'map');
  // Sticky-top height is used by both the map view AND the desktop filter
  // sidebar (positioned just below the sticky header). Compute on every render.
  const stickyTop = document.querySelector('.sticky-top') as HTMLElement | null;
  const banner = document.querySelector('.wrap-banner') as HTMLElement | null;
  const bannerH = banner && banner.style.display !== 'none' ? banner.offsetHeight : 0;
  const h = (stickyTop?.offsetHeight || 0) + bannerH;
  document.documentElement.style.setProperty('--sticky-top-h', h + 'px');

  controls.style.display = (state.currentView === 'discover' || state.currentView === 'map') ? '' : 'none';

  switch (state.currentView) {
    case 'discover': renderFilters(); renderDiscover(content); break;
    case 'map':      renderFilters(); renderMap(content);      break;
    case 'resolve':  renderResolve(content);                    break;
    case 'schedule': renderSchedule(content);                   break;
  }
}

async function routeAndRender() {
  const route = parsePath(window.location.pathname);

  if (route.mode === 'landing') {
    if (window.location.pathname === '/' && !route.error) {
      const target = await pickSmartEntry();
      if (target) {
        navigate(target);
        return;
      }
    }
    setDocumentMeta(null, null);
    if (getState().city) {
      resetCity();
    } else {
      render();
    }
    return;
  }

  applyTheme(route.city.theme);
  setDocumentMeta(route.city, route.launchSlug);
  const titleEl = document.getElementById('app-title');
  const subtitleEl = document.getElementById('app-subtitle');
  if (titleEl) titleEl.textContent = route.city.header.title;
  if (subtitleEl) subtitleEl.textContent = route.city.header.subtitle;
  localStorage.setItem('lastCity', route.city.slug);

  const current = getState();
  if (current.city?.slug === route.city.slug) {
    setLaunch(route.launchSlug);
  } else {
    await initCity(route.city, route.launchSlug);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkUnlockFromUrl();
  onStateChange(render);

  window.addEventListener('popstate', () => { routeAndRender(); });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setView(tab.getAttribute('data-view') as ViewMode);
    });
  });

  const filterToggle = document.getElementById('filter-toggle');
  if (filterToggle) filterToggle.style.display = 'none';

  // Mobile filter sheet wiring
  document.getElementById('mobile-filter-btn')?.addEventListener('click', openFilterSheet);
  document.getElementById('mobile-search-btn')?.addEventListener('click', openSearchSheet);
  document.getElementById('filter-sheet-close')?.addEventListener('click', closeFilterSheet);
  document.getElementById('sheet-backdrop')?.addEventListener('click', closeFilterSheet);
  document.getElementById('clear-all-filters')?.addEventListener('click', () => {
    clearFilters();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFilterSheet();
  });

  function updateStickyOffset() {
    const banner = document.getElementById('wrap-banner');
    const stickyTop = document.querySelector('.sticky-top') as HTMLElement;
    if (stickyTop) {
      const bannerH = banner && banner.style.display !== 'none' ? banner.offsetHeight : 0;
      stickyTop.style.top = bannerH + 'px';
    }
  }
  updateStickyOffset();

  const banner = document.getElementById('wrap-banner');
  if (banner && localStorage.getItem('banner-dismissed')) {
    banner.style.display = 'none';
    updateStickyOffset();
    const li = document.getElementById('linkedin-link');
    if (li) li.classList.add('glow');
  }
  document.getElementById('banner-close')?.addEventListener('click', () => {
    if (banner) banner.style.display = 'none';
    localStorage.setItem('banner-dismissed', '1');
    updateStickyOffset();
    const li = document.getElementById('linkedin-link');
    if (li) li.classList.add('glow');
  });

  routeAndRender();
});
