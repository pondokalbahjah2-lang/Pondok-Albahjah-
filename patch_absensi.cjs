const fs = require('fs');
let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

// 1. Add accuracy state
code = code.replace(
  'const [distanceMeters, setDistanceMeters] = useState<number | null>(null);',
  'const [distanceMeters, setDistanceMeters] = useState<number | null>(null);\n  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);'
);

// 2. Set accuracy in watchPosition
code = code.replace(
  /setCurrentLng\(lng\);/g,
  'setCurrentLng(lng);\n          setAccuracyMeters(pos.coords.accuracy);'
);

// 3. Display accuracy in UI
const uiAnchor = `<p className="text-xs text-slate-500 mt-1">
              Jarak dari titik Pondok: <strong className="text-slate-800 dark:text-slate-200">{Math.round(distanceMeters)} meter</strong> (Maks: {locationSettings.radiusMaxMeters}m)
            </p>`;
const uiReplacement = `<p className="text-xs text-slate-500 mt-1">
              Jarak dari titik Pondok: <strong className="text-slate-800 dark:text-slate-200">{Math.round(distanceMeters)} meter</strong> (Maks: {locationSettings.radiusMaxMeters}m)
            </p>
            {accuracyMeters !== null && (
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Akurasi GPS: ± {Math.round(accuracyMeters)} meter
              </p>
            )}`;
code = code.replace(uiAnchor, uiReplacement);

fs.writeFileSync('src/components/AbsensiView.tsx', code);
console.log('AbsensiView patched.');
