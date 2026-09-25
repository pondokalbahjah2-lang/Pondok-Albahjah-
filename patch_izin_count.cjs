const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

// First chart izin count
content = content.replace(
  `        if (parseInt(y) === currentYear && parseInt(m) === currentMonth + 1) {
          const day = parseInt(d);
          if (day >= startDay && day <= endDay) {
            izinCount++;
          }
        }`,
  `        if (parseInt(y) === currentYear && parseInt(m) === currentMonth + 1) {
          const day = parseInt(d);
          if (day >= startDay && day <= endDay && e.status !== 'Menunggu Persetujuan' && e.status !== 'Ditolak' && e.status !== 'Pending') {
            izinCount++;
          }
        }`
);

// Another chart for exitPermissions
// Top 5 Izin Keluar:
content = content.replace(
  `    exitPermissions.forEach((ep) => {
      const p = pejuangMap.get(ep.pejuangId);
      if (p) {
        p.count += 1;
        if (ep.status === 'Terlambat') {
          p.lateCount += 1;
        }
      }
    });`,
  `    exitPermissions.forEach((ep) => {
      if (ep.status === 'Menunggu Persetujuan' || ep.status === 'Ditolak' || ep.status === 'Pending') return;
      const p = pejuangMap.get(ep.pejuangId);
      if (p) {
        p.count += 1;
        if (ep.status === 'Terlambat') {
          p.lateCount += 1;
        }
      }
    });`
);

// chartDataDivisi
content = content.replace(
  `    exitPermissions.forEach((ep) => {
      if (divStats[ep.subDivisi]) {
        divStats[ep.subDivisi].izin += 1;
      }
    });`,
  `    exitPermissions.forEach((ep) => {
      if (ep.status === 'Menunggu Persetujuan' || ep.status === 'Ditolak' || ep.status === 'Pending') return;
      if (divStats[ep.subDivisi]) {
        divStats[ep.subDivisi].izin += 1;
      }
    });`
);

// totalIzinKeluar
content = content.replace(
  `let totalIzinKeluar = exitPermissions.length;`,
  `let totalIzinKeluar = exitPermissions.filter(e => e.status !== 'Menunggu Persetujuan' && e.status !== 'Ditolak' && e.status !== 'Pending').length;`
);

fs.writeFileSync('src/components/DashboardView.tsx', content);

console.log("Izin count charts patched.");
