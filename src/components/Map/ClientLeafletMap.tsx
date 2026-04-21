'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
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

const createCustomIcon = (campName: string) => {
  return new L.DivIcon({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; transform: translate(-50%, -100%); width: 200px;">
        <div style="width: 40px; height: 50px; display:flex; justify-content:center;">
           ${svgIcon}
        </div>
        <span style="color: #FFD700; font-weight: 900; font-size: 11px; text-shadow: 1px 1px 4px black, -1px -1px 4px black, 1px -1px 4px black, -1px 1px 4px black; letter-spacing: 0.5px; margin-top: 2px; text-transform: uppercase;">
           ${campName}
        </span>
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [0, 0], // The offset is managed by the translate -50% -100% inside the div
    iconAnchor: [0, 0]
  });
};

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

// Custom style for cluster markers
const createClusterCustomIcon = function (cluster: any) {
  return L.divIcon({
    html: `<div style="background-color: #FFD700; color: #000; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; border: 4px solid #18181B; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);">${cluster.getChildCount()}</div>`,
    className: 'custom-marker-cluster',
    iconSize: L.point(40, 40, true),
  });
};

export default function ClientLeafletMap({ camps, onMapClick, onCampClick, flyTarget, onCenterChange }: any) {
  // Mackay QLD Center
  const initialCenter: [number, number] = [-21.18214245789904, 149.13818736701813];

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

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        showCoverageOnHover={false}
        spiderfyOnMaxZoom={true}
        zoomToBoundsOnClick={true}
        maxClusterRadius={60}
      >
        {camps.map((camp: any) => (
          <Marker
            key={camp.id}
            position={[camp.lat, camp.lng]}
            icon={createCustomIcon(camp.name)}
            eventHandlers={{ click: () => onCampClick(camp) }}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
