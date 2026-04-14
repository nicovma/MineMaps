'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SVG Icon Data URI with Tent aesthetic
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="40" height="50">
  <path fill="#FFD700" d="M192 0C86 0 0 86 0 192c0 106 192 320 192 320s192-214 192-320c0-106-86-192-192-192z"/>
  <path fill="#18181B" d="M192 100L90 270h204L192 100z" />
  <path fill="#FFD700" d="M192 130L175 270h34L192 130z" />
</svg>
`;

const customIcon = new L.DivIcon({
  html: svgIcon,
  className: '',
  iconSize: [40, 50],
  iconAnchor: [20, 50]
});

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function FlightController({ targetCords }: { targetCords: { lat: number, lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (targetCords) {
      map.flyTo([targetCords.lat, targetCords.lng], 14, { duration: 1.5 });
    }
  }, [targetCords, map]);
  return null;
}

function MapTracker({ onMove }: { onMove: (pos: { lat: number, lng: number }) => void }) {
  useMapEvents({
    moveend(e) {
      const center = e.target.getCenter();
      onMove({ lat: center.lat, lng: center.lng });
    }
  });
  return null;
}

export default function ClientLeafletMap({ camps, onMapClick, onCampClick, flyTarget, onCenterChange }: any) {
  // Mackay QLD Center
  const initialCenter: [number, number] = [-37.3305, -59.1432];

  return (
    <MapContainer
      center={initialCenter as [number, number]}
      zoom={8}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
      className="bg-zinc-950"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
      />
      <ZoomControl position="topright" />
      <ClickHandler onMapClick={onMapClick} />
      <FlightController targetCords={flyTarget} />
      <MapTracker onMove={onCenterChange} />

      {camps.map((camp: any) => (
        <Marker
          key={camp.id}
          position={[camp.lat, camp.lng]}
          icon={customIcon}
          eventHandlers={{ click: () => onCampClick(camp) }}
        />
      ))}
    </MapContainer>
  );
}
