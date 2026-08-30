const fs = require('fs');
let code = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');

code = code.replace(
  '  const userNavigationItems = [\n    { id: \'absensi\', label: \'Absensi GPS\', icon: MapPin },',
  '  const userNavigationItems = [\n    { id: \'dashboard\', label: \'Dashboard\', icon: LayoutDashboard },\n    { id: \'absensi\', label: \'Absensi GPS\', icon: MapPin },'
);

fs.writeFileSync('src/components/iOSGlassLayout.tsx', code);
console.log('Fixed sidebar');
