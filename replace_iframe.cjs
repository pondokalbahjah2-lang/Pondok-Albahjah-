const fs = require('fs');
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

const targetStr = `<div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 relative">
              <iframe 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                src={\`https://maps.google.com/maps?q=\${selectedMapRecord.latitude},\${selectedMapRecord.longitude}&z=16&output=embed\`}
                title="Peta Lokasi GPS"
              />
            </div>`;

const newStr = `<LocationMap 
              userLat={selectedMapRecord.latitude}
              userLng={selectedMapRecord.longitude}
              pondokLat={locationSettings.latitude}
              pondokLng={locationSettings.longitude}
              radius={locationSettings.radiusMaxMeters}
              height="h-80"
            />`;

content = content.replace(targetStr, newStr);
fs.writeFileSync('src/components/AbsensiView.tsx', content);
