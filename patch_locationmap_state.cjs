const fs = require('fs');
let code = fs.readFileSync('src/components/LocationMap.tsx', 'utf8');

const anchor = `  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';`;
const replacement = `  const [mapType, setMapType] = useState('roadmap');
  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';`;

if (code.includes(anchor) && !code.includes('const [mapType, setMapType]')) {
  code = code.replace(anchor, replacement);
  fs.writeFileSync('src/components/LocationMap.tsx', code);
  console.log('LocationMap patched with state.');
} else {
  console.log('Anchor not found or already patched.');
}
