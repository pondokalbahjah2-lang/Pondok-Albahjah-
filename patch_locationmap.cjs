const fs = require('fs');
let code = fs.readFileSync('src/components/LocationMap.tsx', 'utf8');

// 1. Add MapPolyline
const polylineCode = `
const MapPolyline = ({ path }: { path: google.maps.LatLngLiteral[] }) => {
  const map = useMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;
    const newPolyline = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#ef4444', // red line
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map,
    });
    setPolyline(newPolyline);
    return () => {
      newPolyline.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (polyline) {
      polyline.setPath(path);
    }
  }, [polyline, path]);

  return null;
};
`;

code = code.replace('const MapCircle', polylineCode + '\nconst MapCircle');

// 2. Add satellite toggle state and logic
const locMapRegex = /(export const LocationMap = [\s\S]*?\(\) => \{)/;
code = code.replace(locMapRegex, `$1\n  const [mapType, setMapType] = useState('roadmap');\n`);

// 3. Add Polyline to Map and toggle button
const mapReturnRegex = /(<APIProvider apiKey=\{apiKey\}>)[\s\S]*?(<\/APIProvider>)/;
const mapCode = `<APIProvider apiKey={apiKey}>
        <div className="absolute top-2 right-2 z-10">
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
        <Map 
          defaultZoom={16} 
          defaultCenter={userPos}
          mapTypeId={mapType}
          mapId="DEMO_MAP_ID"
          disableDefaultUI={true}
          gestureHandling="greedy"
        >
          <AdvancedMarker position={userPos} title="Lokasi Anda">
            <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
          </AdvancedMarker>
          <AdvancedMarker position={pondokPos} title="Lokasi Pondok" />
          <MapCircle center={pondokPos} radius={radius} />
          <MapPolyline path={[userPos, pondokPos]} />
          <MapBounds userPos={userPos} pondokPos={pondokPos} />
        </Map>
      </APIProvider>`;

code = code.replace(mapReturnRegex, mapCode);
fs.writeFileSync('src/components/LocationMap.tsx', code);
console.log('LocationMap patched');
