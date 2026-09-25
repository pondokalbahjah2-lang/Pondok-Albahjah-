const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');
content = content.replace(
  "const pendingIzin = exitPermissions.filter(e => e.status === 'Pending').length;",
  "const pendingIzin = exitPermissions.filter(e => e.status === 'Menunggu Persetujuan').length;"
);

fs.writeFileSync('src/components/DashboardView.tsx', content);

console.log("Pending Izin patched.");
