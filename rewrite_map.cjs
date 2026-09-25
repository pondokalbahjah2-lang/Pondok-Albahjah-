const fs = require('fs');

const content = `import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon missing issues in some build tools
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon for Pondok (red)
const pondokIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for User (blue)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to adjust bounds to fit both markers
function MapBounds({ userPos, pondokPos }: { userPos: [number, number], pondokPos: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (userPos[0] && pondokPos[0]) {
      const bounds = L.latLngBounds([userPos, pondokPos]);
      // Add some padding so markers aren't right at the edge
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [userPos, pondokPos, map]);

  return null;
}

export const LocationMap = ({ 
  userLat, 
  userLng, 
  pondokLat, 
  pondokLng, 
  radius,
  height = "h-40"
}: { 
  userLat: number, 
  userLng: number, 
  pondokLat: number, 
  pondokLng: number, 
  radius: number,
  height?: string
}) => {
  const [mapType, setMapType] = useState('roadmap');
  
  const userPos: [number, number] = [userLat, userLng];
  const pondokPos: [number, number] = [pondokLat, pondokLng];
  
  // Choose tile layer based on mapType
  const tileUrl = mapType === 'roadmap' 
    ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  return (
    <div className={\`w-full \${height} rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0\`}>
      <div className="absolute top-2 right-2 z-[400]">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap');
          }}
          className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center"
          title={mapType === 'roadmap' ? 'Ubah ke Satelit' : 'Ubah ke Peta Standar'}
        >
          {mapType === 'roadmap' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.9 20h.1l5.4-11.4 3.7 2.1-4.7 10h1.8a2 2 0 0 0 1.9-1.3L23 12a11.1 11.1 0 0 0-2.8-5L15 2 11.9 20z"></path><path d="m2 12 3.1-6.6a11.1 11.1 0 0 1 2.8-5L15 2l-3.1 18h-.1L6.4 8.6 2.7 6.5 7.4 17H5.6a2 2 0 0 1-1.9-1.3L2 12z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          )}
        </button>
      </div>

      <MapContainer 
        center={userPos} 
        zoom={16} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />
        
        <Marker position={userPos} icon={userIcon}>
          <Popup>Lokasi Anda Saat Ini</Popup>
        </Marker>
        
        <Marker position={pondokPos} icon={pondokIcon}>
          <Popup>Lokasi Titik Pondok</Popup>
        </Marker>
        
        <Circle 
          center={pondokPos} 
          radius={radius} 
          pathOptions={{ 
            color: '#22c55e', 
            fillColor: '#22c55e', 
            fillOpacity: 0.35, 
            weight: 2 
          }} 
        />
        
        <Polyline 
          positions={[userPos, pondokPos]} 
          pathOptions={{ color: '#ef4444', weight: 2 }} 
        />
        
        <MapBounds userPos={userPos} pondokPos={pondokPos} />
      </MapContainer>
    </div>
  );
};
`;

fs.writeFileSync('src/components/LocationMap.tsx', content);
console.log("Rewrote LocationMap to use Leaflet");
