const fs = require('fs');
let content = fs.readFileSync('src/components/LocationMap.tsx', 'utf8');

content = content.replace(
  'const MapCircle = ({ center, radius }: { center: google.maps.LatLngLiteral; radius: number,  height?: string }) => {',
  'const MapCircle = ({ center, radius }: { center: google.maps.LatLngLiteral; radius: number }) => {'
);

fs.writeFileSync('src/components/LocationMap.tsx', content);
