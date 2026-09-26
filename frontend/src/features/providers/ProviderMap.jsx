import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * OpenStreetMap view of providers. The list stays the primary interface; the
 * map is an optional view and every marker has a text equivalent in the list.
 */
export default function ProviderMap({ providers, onSelect }) {
  const el = useRef(null);

  useEffect(() => {
    const points = providers.filter((p) => p.lat != null);
    if (!el.current || !points.length) return undefined;
    const map = L.map(el.current, { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    const markers = points.map((p) =>
      L.circleMarker([p.lat, p.lon], {
        radius: 9,
        color: getComputedStyle(document.documentElement).getPropertyValue('--demo').trim() || '#7a2d63',
        weight: 2,
        dashArray: '3 3',
        fillOpacity: 0.25,
      })
        .addTo(map)
        .bindTooltip(`${p.name} (demo)`)
        .on('click', () => onSelect?.(p.id)),
    );
    map.fitBounds(L.featureGroup(markers).getBounds().pad(0.3));
    return () => map.remove();
  }, [providers, onSelect]);

  return (
    <div
      ref={el}
      className="h-80 w-full overflow-hidden rounded-md border border-rule sm:h-[28rem]"
      role="region"
      aria-label="Map of demo providers. The same providers are listed below."
    />
  );
}
