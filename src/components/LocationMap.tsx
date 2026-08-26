import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

const MapCircle = ({ center, radius }: { center: google.maps.LatLngLiteral; radius: number }) => {
  const map = useMap();
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;
    const newCircle = new window.google.maps.Circle({
      strokeColor: '#22c55e', 
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#22c55e',
      fillOpacity: 0.35,
      map,
      center,
      radius,
    });
    setCircle(newCircle);
    return () => {
      newCircle.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (circle) {
      circle.setCenter(center);
      circle.setRadius(radius);
    }
  }, [circle, center, radius]);

  return null;
};

function MapBounds({ userPos, pondokPos }: { userPos: {lat: number, lng: number}, pondokPos: {lat: number, lng: number} }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(userPos);
    bounds.extend(pondokPos);
    map.fitBounds(bounds, 20);
  }, [userPos, pondokPos, map]);
  return null;
}

export const LocationMap = ({ 
  userLat, 
  userLng, 
  pondokLat, 
  pondokLng, 
  radius 
}: { 
  userLat: number, 
  userLng: number, 
  pondokLat: number, 
  pondokLng: number, 
  radius: number 
}) => {
  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Fallback to simple iframe if no API key is provided yet
  if (!apiKey) {
    return (
      <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0 bg-slate-200 dark:bg-slate-700">
        <iframe 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          src={`https://maps.google.com/maps?q=${userLat},${userLng}&z=16&output=embed`}
          title="Peta Lokasi GPS Anda"
        />
      </div>
    );
  }

  const userPos = { lat: userLat, lng: userLng };
  const pondokPos = { lat: pondokLat, lng: pondokLng };

  return (
    <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0">
      <APIProvider apiKey={apiKey}>
        <Map 
          defaultZoom={16} 
          defaultCenter={userPos}
          mapId="DEMO_MAP_ID"
          disableDefaultUI={true}
          gestureHandling="greedy"
        >
          <AdvancedMarker position={userPos} title="Lokasi Anda" />
          <AdvancedMarker position={pondokPos} title="Lokasi Pondok" />
          <MapCircle center={pondokPos} radius={radius} />
          <MapBounds userPos={userPos} pondokPos={pondokPos} />
        </Map>
      </APIProvider>
    </div>
  );
};
