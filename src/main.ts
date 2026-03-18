import './style.css';
import { inject } from '@vercel/analytics';
import { init, onStateChange, getState, setView } from './state';
import { renderDiscover } from './views/discover';
import { renderResolve } from './views/resolve';
import { renderSchedule } from './views/schedule';
import { renderMap, destroyMap } from './views/map';
import { renderFilters } from './components/filters';
import { ViewMode } from './data/types';
import { checkUnlockFromUrl } from './paywall';

inject();

function render() {
  const state = getState();
  const content = document.getElementById('content')!;
  const controls = document.getElementById('controls')!;

  // Update stats
  document.getElementById('starred-count')!.textContent = String(state.starred.size);
  const unresolvedCount = state.conflicts.filter(c => !c.resolved).length;
  document.getElementById('conflict-count')!.textContent = String(unresolvedCount);
  const badge = document.getElementById('resolve-badge')!;
  badge.textContent = String(unresolvedCount);
  badge.style.display = unresolvedCount > 0 ? '' : 'none';

  // Update active tab
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-view') === state.currentView);
  });

  // Clean up map when switching away
  if (state.currentView !== 'map') {
    destroyMap();
  }

  // Toggle body class for map view (hides footer, locks scroll)
  document.body.classList.toggle('view-map', state.currentView === 'map');
  if (state.currentView === 'map') {
    const stickyTop = document.querySelector('.sticky-top') as HTMLElement;
    const banner = document.querySelector('.wrap-banner') as HTMLElement;
    const h = (stickyTop?.offsetHeight || 0) + (banner?.offsetHeight || 0);
    document.documentElement.style.setProperty('--sticky-top-h', h + 'px');
  }

  // Show/hide filters (discover and map views)
  controls.style.display = (state.currentView === 'discover' || state.currentView === 'map') ? '' : 'none';

  // Render
  switch (state.currentView) {
    case 'discover':
      renderFilters();
      renderDiscover(content);
      break;
    case 'map':
      renderFilters();
      renderMap(content);
      break;
    case 'resolve':
      renderResolve(content);
      break;
    case 'schedule':
      renderSchedule(content);
      break;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkUnlockFromUrl();
  init();
  onStateChange(render);

  // Tab navigation
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setView(tab.getAttribute('data-view') as ViewMode);
    });
  });

  // Filters always visible — hide the toggle
  const filterToggle = document.getElementById('filter-toggle')!;
  filterToggle.style.display = 'none';

  // Position sticky header below sticky banner
  function updateStickyOffset() {
    const banner = document.getElementById('wrap-banner');
    const stickyTop = document.querySelector('.sticky-top') as HTMLElement;
    if (stickyTop) {
      const bannerH = banner && banner.style.display !== 'none' ? banner.offsetHeight : 0;
      stickyTop.style.top = bannerH + 'px';
    }
  }
  updateStickyOffset();

  // Banner close button (remember across sessions)
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

  render();
});
