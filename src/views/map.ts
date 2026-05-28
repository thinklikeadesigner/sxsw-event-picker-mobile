import L from 'leaflet';
import { CityEvent } from '../data/types';
import { getState, toggleStar, getActiveEvents } from '../state';
import { dayKey, fmt } from '../utils/time';
import { isEventLocked, isMusicEvent } from '../paywall';

// Fix Leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
let userMarker: L.CircleMarker | null = null;
let happeningSoon = false;

let venueCoords: Record<string, [number, number]> = {};
let venueCoordsCityKey: string | null = null;

async function ensureCoords(): Promise<Record<string, [number, number]>> {
  const city = getState().city;
  if (!city) return {};
  if (venueCoordsCityKey === city.slug) return venueCoords;
  venueCoords = await city.loadCoordinates();
  venueCoordsCityKey = city.slug;
  return venueCoords;
}

function createMap(container: HTMLElement): L.Map {
  container.innerHTML = '';

  const mapDiv = document.createElement('div');
  mapDiv.id = 'map-container';
  mapDiv.style.width = '100%';
  mapDiv.style.overflow = 'hidden';
  container.appendChild(mapDiv);

  const tlDiv = document.createElement('div');
  tlDiv.id = 'timeline-container';
  container.appendChild(tlDiv);

  const city = getState().city;
  const center: [number, number] = city?.map.center ?? [30.2672, -97.7431];
  const zoom = city?.map.zoom ?? 14;
  map = L.map('map-container').setView(center, zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
    subdomains: 'abcd',
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  // Add "Happening Soon" toggle
  const toggle = new L.Control({ position: 'topright' });
  toggle.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-toggle');
    div.innerHTML = `<button class="map-soon-btn" id="map-soon-btn">Happening Soon</button>`;
    L.DomEvent.disableClickPropagation(div);
    return div;
  };
  toggle.addTo(map);

  // Add "My Location" button
  const locBtn = new L.Control({ position: 'bottomright' });
  locBtn.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-toggle');
    div.innerHTML = `<button class="map-loc-btn" id="map-loc-btn" title="Center on my location">\u25CE</button>`;
    L.DomEvent.disableClickPropagation(div);
    return div;
  };
  locBtn.addTo(map);

  return map;
}

export async function renderMap(container: HTMLElement) {
  await ensureCoords();
  const { starred, currentDay, filters } = getState();
  const events = getActiveEvents();

  if (!map || !container.querySelector('#map-container')) {
    if (map) {
      map.remove();
      map = null;
      markersLayer = null;
    }
    createMap(container);
  }

  // Clear existing markers
  markersLayer!.clearLayers();

  // Bind toggle button
  const soonBtn = document.getElementById('map-soon-btn');
  if (soonBtn) {
    soonBtn.classList.toggle('active', happeningSoon);
    soonBtn.onclick = () => {
      happeningSoon = !happeningSoon;
      renderMap(container);
    };
  }

  // Filter events for current day
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  const dayEvents = events.filter(e => {
    if (dayKey(e.start) !== currentDay) return false;
    // Past events stay on the map — only the "Happening Soon" toggle below
    // applies a time-based filter, and only when the user explicitly enables it.
    const cost = (e.cost || '').toLowerCase();
    if (filters.cost === 'free' && cost !== 'free') return false;
    if (filters.cost === 'register' && cost !== 'register') return false;
    if (filters.cost === 'approval' && !cost.includes('approval')) return false;
    if (filters.cost === 'request' && !cost.includes('request')) return false;
    if (filters.cost === 'paid' && !/\$/.test(e.cost)) return false;
    if (happeningSoon) {
      const isHappening = e.start <= now && e.end > now;
      const isStartingSoon = e.start > now && e.start <= oneHourFromNow;
      if (!isHappening && !isStartingSoon) return false;
    }
    return true;
  });

  // Place markers
  for (const event of dayEvents) {
    const coords = venueCoords[event.location];
    if (!coords) continue;

    const locked = isEventLocked(event);
    const isMusic = isMusicEvent(event);
    const isStarred = starred.has(event.index);

    const marker = L.circleMarker([coords[0], coords[1]], {
      radius: 8,
      fillColor: locked ? '#a78bfa' : isStarred ? '#4ade80' : isMusic ? '#c4b5fd' : '#3b82f6',
      color: locked ? '#4c1d95' : isStarred ? '#166534' : isMusic ? '#6d28d9' : '#1e40af',
      weight: 2,
      opacity: locked ? 0.5 : 1,
      fillOpacity: locked ? 0.4 : 0.8,
    });

    const popupContent = locked
      ? `<div style="font-family:-apple-system,sans-serif;min-width:180px">
          <strong style="font-size:14px;color:#a78bfa">&#x1F512; ${event.summary}</strong><br>
          <span style="color:#666;font-size:12px">Music Event &middot; Locked</span><br>
          <span style="color:#888;font-size:11px">${event.location.split(',')[0]}</span><br>
          <span style="color:#a78bfa;font-size:11px;margin-top:4px;display:inline-block">Unlock music events to see details</span>
        </div>`
      : `<div style="font-family:-apple-system,sans-serif;min-width:200px">
        <strong style="font-size:14px">${event.summary}</strong><br>
        <span style="color:#666;font-size:12px">${fmt(event.start)} \u2013 ${fmt(event.end)}</span><br>
        ${event.cost ? `<span style="color:#7c3aed;font-size:12px">${event.cost}</span><br>` : ''}
        ${event.type ? `<span style="color:#059669;font-size:12px">${event.type}</span><br>` : ''}
        <a href="https://maps.google.com/?q=${encodeURIComponent(event.location)}" target="_blank" style="color:#3b82f6;font-size:11px;text-decoration:none">\uD83D\uDCCD ${event.location}</a><br>
        ${event.url ? `<a href="${event.url}" target="_blank" style="color:#3b82f6;font-size:12px;text-decoration:none">Event page \u2197</a><br>` : ''}
        <button onclick="window.__toggleStar(${event.index})" style="margin-top:6px;padding:4px 12px;border-radius:6px;border:1px solid ${isStarred ? '#ef4444' : '#4ade80'};background:${isStarred ? '#1a0000' : '#052e16'};color:${isStarred ? '#ef4444' : '#4ade80'};cursor:pointer;font-size:12px;font-weight:600">
          ${isStarred ? '\u2605 Unstar' : '\u2606 Star'}
        </button>
      </div>`;

    marker.bindPopup(popupContent);
    (marker as any).__eventIndex = event.index;
    markersLayer!.addLayer(marker);
  }

  // Expose toggle function globally for popup buttons
  (window as any).__toggleStar = (index: number) => {
    toggleStar(index);
  };

  // Show user's current location
  function updateUserLocation(center?: boolean) {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      if (!map) return;
      const { latitude, longitude } = pos.coords;
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.circleMarker([latitude, longitude], {
        radius: 10,
        fillColor: '#e839f6',
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);
      userMarker.bindPopup('<strong style="font-family:-apple-system,sans-serif">You are here</strong>');
      if (center) map.setView([latitude, longitude], 16);
    }, () => {});
  }
  updateUserLocation();

  // Bind location button
  const locBtnEl = document.getElementById('map-loc-btn');
  if (locBtnEl) {
    locBtnEl.onclick = () => updateUserLocation(true);
  }

  // Invalidate size after render (Leaflet needs this when container changes)
  setTimeout(() => map?.invalidateSize(), 100);

  // --- Timeline below map ---
  const timelineDiv = document.getElementById('timeline-container');
  if (timelineDiv) renderTimeline(timelineDiv, dayEvents, now);
}

function renderTimeline(container: HTMLElement, events: CityEvent[], now: Date) {
  if (events.length === 0) {
    container.innerHTML = '';
    return;
  }

  // Find time bounds for the day
  const starts = events.map(e => e.start.getTime());
  const ends = events.map(e => e.end.getTime());
  const dayStart = Math.min(...starts);
  const dayEnd = Math.max(...ends);
  const totalMs = dayEnd - dayStart;
  if (totalMs <= 0) { container.innerHTML = ''; return; }

  // Generate hour labels
  const firstHour = new Date(dayStart);
  firstHour.setMinutes(0, 0, 0);
  const hours: Date[] = [];
  for (let t = firstHour.getTime(); t <= dayEnd; t += 3600000) {
    if (t >= dayStart - 3600000) hours.push(new Date(t));
  }

  const hourLabels = hours.map(h => {
    const hr = h.getHours();
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const h12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    const pct = ((h.getTime() - dayStart) / totalMs) * 100;
    return `<div class="tl-hour" style="left:${pct}%">${h12} ${ampm}</div>`;
  }).join('');

  // Now line
  const nowPct = ((now.getTime() - dayStart) / totalMs) * 100;
  const nowLine = (nowPct >= 0 && nowPct <= 100)
    ? `<div class="tl-now" style="left:${nowPct}%"></div>`
    : '';

  // Sort events by start time
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

  // Assign rows (simple greedy lane assignment to avoid overlap)
  const lanes: number[] = []; // end times per lane
  const eventLanes: number[] = [];
  for (const e of sorted) {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      if (e.start.getTime() >= lanes[i]) {
        lanes[i] = e.end.getTime();
        eventLanes.push(i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.push(e.end.getTime());
      eventLanes.push(lanes.length - 1);
    }
  }

  const rowHeight = 28;
  const totalHeight = lanes.length * (rowHeight + 4) + 40;

  const bars = sorted.map((e, i) => {
    const left = ((e.start.getTime() - dayStart) / totalMs) * 100;
    const width = ((e.end.getTime() - e.start.getTime()) / totalMs) * 100;
    const top = eventLanes[i] * (rowHeight + 4);
    const isMusic = e.type === 'Music + Live Show';
    const bg = isMusic ? '#7c3aed' : '#2563eb';
    const label = e.summary.length > 30 ? e.summary.slice(0, 28) + '...' : e.summary;
    return `<div class="tl-bar" data-index="${e.index}" style="left:${left}%;width:${Math.max(width, 1.5)}%;top:${top}px;background:${bg}" title="${e.summary}\n${fmt(e.start)} \u2013 ${fmt(e.end)}\n${e.location}">${label}</div>`;
  }).join('');

  container.innerHTML = `
    <div class="tl-wrapper">
      <div class="tl-label">Timeline</div>
      <div class="tl-scroll">
        <div class="tl-track" style="height:${totalHeight}px;min-width:800px">
          <div class="tl-hours">${hourLabels}</div>
          <div class="tl-bars" style="position:relative;top:30px">${bars}</div>
          ${nowLine}
        </div>
      </div>
    </div>`;

  // Bind click on timeline bars
  container.querySelectorAll('.tl-bar').forEach(bar => {
    bar.addEventListener('click', () => {
      const idx = parseInt(bar.getAttribute('data-index') || '-1');
      if (idx < 0) return;
      const event = events.find(e => e.index === idx);
      if (!event) return;

      const isMobile = window.innerWidth <= 768;
      const coords = venueCoords[event.location];

      // On desktop, try to pan map to the venue first
      if (!isMobile && map && markersLayer && coords) {
        map.setView([coords[0], coords[1]], 16);
        // Open the popup for the SPECIFIC event clicked, not whatever marker happens
        // to share coords. Boston uses neighborhood centroids so 10+ events stack at
        // the same latlng — without this guard, the last marker added at those coords
        // wins, which shows the wrong event.
        markersLayer.eachLayer((layer: any) => {
          if (layer.__eventIndex === event.index) {
            layer.openPopup();
          }
        });
        return;
      }

      // Show modal (mobile, or desktop fallback when no coords)
      const starred = getState().starred.has(event.index);
      const isMusic = event.type === 'Music + Live Show';
      let modal = document.getElementById('tl-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tl-modal';
        document.body.appendChild(modal);
      }
      modal.innerHTML = `
        <div class="tl-modal-overlay">
          <div class="tl-modal-card">
            <button class="tl-modal-close" id="tl-modal-close">&times;</button>
            <div class="event-name" style="font-size:16px;font-weight:700;margin-bottom:8px">${event.summary}</div>
            <div class="event-meta" style="margin-bottom:8px">
              <span class="pill pill-time">${fmt(event.start)} \u2013 ${fmt(event.end)}</span>
              ${event.cost ? `<span class="pill pill-cost">${event.cost}</span>` : ''}
              ${isMusic ? '<span class="pill pill-music">\uD83C\uDFB5 Live Music</span>' : `<span class="pill pill-type">${event.type}</span>`}
            </div>
            ${event.location ? `<div style="margin-bottom:6px">\uD83D\uDCCD <a href="https://maps.google.com/?q=${encodeURIComponent(event.location)}" target="_blank" style="color:#3b82f6;text-decoration:none">${event.location}</a></div>` : ''}
            ${event.url ? `<div style="margin-bottom:6px"><a href="${event.url}" target="_blank" style="color:#3b82f6;text-decoration:none">Event page \u2197</a></div>` : ''}
            ${event.description ? `<div style="font-size:12px;color:#999;margin-top:8px">${event.description}</div>` : ''}
            <button onclick="window.__toggleStar(${event.index})" style="margin-top:12px;padding:8px 16px;border-radius:8px;border:1px solid ${starred ? '#ef4444' : '#4ade80'};background:${starred ? '#1a0000' : '#052e16'};color:${starred ? '#ef4444' : '#4ade80'};cursor:pointer;font-size:13px;font-weight:600;width:100%">
              ${starred ? '\u2605 Unstar' : '\u2606 Star this event'}
            </button>
          </div>
        </div>`;
      modal.style.display = 'block';
      document.getElementById('tl-modal-close')?.addEventListener('click', () => {
        modal!.style.display = 'none';
      });
      modal.querySelector('.tl-modal-overlay')?.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).classList.contains('tl-modal-overlay')) {
          modal!.style.display = 'none';
        }
      });
    });
  });
}

export function destroyMap() {
  if (map) {
    map.remove();
    map = null;
    markersLayer = null;
  }
}
