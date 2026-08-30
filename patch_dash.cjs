const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');
code = code.replace(
  /const dayName = d.toLocaleDateString\('id-ID', \{ weekday: 'short' \}\);/,
  "let dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });\n      if (dayName === 'Min') dayName = 'Ahd';"
);
fs.writeFileSync('src/components/DashboardView.tsx', code);
