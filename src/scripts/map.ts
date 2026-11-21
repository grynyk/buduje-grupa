/**
 * Office map — MapLibre GL + OpenFreeMap (free OpenStreetMap vector tiles: no API key, no cookies).
 * Loaded on demand by MapBand.astro when the map scrolls near the viewport.
 */
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// The worker is a separate file in MapLibre 6; register its bundled URL explicitly
// (its default lookup is relative to MapLibre's own file, which the bundler moves).
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

maplibregl.setWorkerUrl(workerUrl);

// OpenFreeMap "Positron": clean, light OpenStreetMap style — free, no API key, commercial use allowed.
// Other OpenFreeMap styles: 'liberty' (full colour, all POIs), 'bright' (saturated).
const STYLE = 'https://tiles.openfreemap.org/styles/positron';

export function mountMap(el: HTMLElement) {
  const lat = parseFloat(el.dataset.lat!);
  const lng = parseFloat(el.dataset.lng!);
  const zoom = parseFloat(el.dataset.zoom || '15');
  const card = el.parentElement?.querySelector<HTMLElement>('[data-map-card]');

  const map = new maplibregl.Map({
    container: el,
    style: STYLE,
    center: [lng, lat],
    zoom,
    // Licence requirement (ODbL): the OpenStreetMap credit must stay visible — keep it expanded.
    attributionControl: { compact: false },
    cooperativeGestures: true, // page scroll is never hijacked: Ctrl/⌘ + scroll or two fingers to move the map
    locale: {
      'CooperativeGesturesHandler.WindowsHelpText': 'Użyj Ctrl + przewijania, aby przybliżyć mapę',
      'CooperativeGesturesHandler.MacHelpText': 'Użyj ⌘ + przewijania, aby przybliżyć mapę',
      'CooperativeGesturesHandler.MobileHelpText': 'Przesuń mapę dwoma palcami',
      'NavigationControl.ZoomIn': 'Przybliż',
      'NavigationControl.ZoomOut': 'Oddal',
      'AttributionControl.ToggleAttribution': 'Pokaż źródła mapy',
    },
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

  // Keep the marker visible beside the address card on wide screens
  const frame = () => {
    const wide = window.matchMedia('(min-width: 1024px)').matches;
    const left = wide && card ? card.getBoundingClientRect().right - el.getBoundingClientRect().left : 0;
    map.jumpTo({ center: [lng, lat], padding: { left, top: 0, right: 0, bottom: 0 } });
  };

  map.on('style.load', frame);
  window.addEventListener('resize', frame);

  // Brand marker: upright pin (round head with the BG® mark + pointer).
  // MapLibre writes its own `transform` on the marker element, so all styling lives on the inner .map-pin.
  const marker = document.createElement('div');
  marker.className = 'map-marker';
  marker.setAttribute('aria-hidden', 'true');
  marker.innerHTML = `
    <span class="map-pin">
      <span class="map-pin__pulse"></span>
      <svg class="map-pin__shape" viewBox="0 0 48 60" width="48" height="60">
        <path d="M24 2C12.4 2 3 11.2 3 22.6 3 38.4 24 57.5 24 57.5S45 38.4 45 22.6C45 11.2 35.6 2 24 2Z" />
      </svg>
      <span class="map-pin__logo">${el.dataset.markerSvg ?? ''}</span>
    </span>`;
  new maplibregl.Marker({ element: marker, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(map);

  el.classList.add('is-ready');
  return map;
}
