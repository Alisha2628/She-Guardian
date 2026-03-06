import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';  // ← Fixed import for Vite

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Extend Leaflet types for heat layer
declare module 'leaflet' {
  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  }

  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: HeatLayerOptions
  ): HeatLayer;

  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: Array<[number, number, number?]>): this;
    redraw(): this;
  }
}

export interface Incident {
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  severity?: number;
}

interface SafeZoneHeatmapProps {
  userLocation?: [number, number];
  incidents: Incident[];
  height?: string;
}

const HeatmapLayerComponent: React.FC<{ points: [number, number, number][] }> = ({ points }) => {
  const map = useMap();
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    if (points.length === 0) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    heatLayerRef.current = L.heatLayer(points, {
      radius: 30,  // Size of heat spots
      blur: 20,    // Smoothness
      maxZoom: 17,
      minOpacity: 0.4,
      max: 1.0,
      gradient: {
        0.2: '#22c55e',  // Green = safe
        0.5: '#eab308',  // Yellow
        0.8: '#f97316',  // Orange
        1.0: '#ef4444',  // Red = unsafe
      },
    }).addTo(map);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [points, map]);

  return null;
};

const SafeZoneHeatmap: React.FC<SafeZoneHeatmapProps> = ({
  userLocation,
  incidents = [],
  height = '500px',
}) => {
  // Convert to [lat, lng, severity] for heatmap
  let heatmapPoints: [number, number, number][] = incidents.map((inc) => [
    inc.location.coordinates[1], // lat
    inc.location.coordinates[0], // lng
    inc.severity ?? 0.6,
  ]);

  // Boost risk at night (after 8 PM or before 6 AM)
  const hour = new Date().getHours();
  if (hour >= 20 || hour <= 6) {
    heatmapPoints = heatmapPoints.map(([lat, lng, sev]) => [lat, lng, Math.min(1, sev * 1.3)]);
  }

  const center: [number, number] = userLocation ?? [19.076, 72.878]; // Mumbai default

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {heatmapPoints.length > 0 && <HeatmapLayerComponent points={heatmapPoints} />}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default SafeZoneHeatmap;