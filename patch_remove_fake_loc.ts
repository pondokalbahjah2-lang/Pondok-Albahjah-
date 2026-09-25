import fs from 'fs';
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

const regex = /                  <button\n                    type="button"\n                    onClick=\{\(\) => \{\n                      const fallbackLat = locationSettings\.latitude \+ \(Math\.random\(\) - 0\.5\) \* 0\.0002;\n                      const fallbackLng = locationSettings\.longitude \+ \(Math\.random\(\) - 0\.5\) \* 0\.0002;\n                      setCurrentLat\(fallbackLat\);\n                      setCurrentLng\(fallbackLng\);\n                      setDistanceMeters\(\n                        calculateDistanceMeters\(fallbackLat, fallbackLng, locationSettings\.latitude, locationSettings\.longitude\)\n                      \);\n                      setLocError\(''\);\n                    \}\}\n                    className="w-full py-1\.5 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"\n                  >\n                    Gunakan Lokasi Simulasi \(Mode Testing\)\n                  <\/button>/g;

content = content.replace(regex, '');
fs.writeFileSync('src/components/AbsensiView.tsx', content);
