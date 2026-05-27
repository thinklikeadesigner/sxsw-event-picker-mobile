import { listCities } from '../cities';
import { navigate } from '../routing/router';

export function renderLanding(container: HTMLElement) {
  const cities = listCities();

  container.innerHTML = `
    <div class="landing">
      <div class="landing-hero">
        <h1>Find events worth your time.</h1>
        <p class="landing-sub">Curated launches across every city we cover. Pick yours.</p>
      </div>
      <div class="landing-grid">
        ${cities.map(c => `
          <button class="landing-tile" data-city="${c.slug}">
            <span class="landing-tile-name">${c.name}</span>
            <span class="landing-tile-meta">${c.launches.length} launch${c.launches.length === 1 ? '' : 'es'}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll<HTMLButtonElement>('.landing-tile').forEach(btn => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-city');
      if (slug) navigate(`/${slug}`);
    });
  });
}
