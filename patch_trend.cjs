const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

content = content.replace(
  `    const cuti = leaveRequests.filter(l => l.tanggalMulai?.startsWith(yearMonth)).length;`,
  `    const cuti = leaveRequests.filter(l => l.tanggalMulai?.startsWith(yearMonth) && (l.status === 'Disetujui' || l.status === 'Sedang Cuti' || l.status === 'Selesai')).length;`
);

content = content.replace(
  `    const izin = exitPermissions.filter(e => e.tanggalKeluar?.startsWith(yearMonth)).length;`,
  `    const izin = exitPermissions.filter(e => e.tanggalKeluar?.startsWith(yearMonth) && e.status !== 'Menunggu Persetujuan' && e.status !== 'Ditolak' && e.status !== 'Pending').length;`
);

fs.writeFileSync('src/components/DashboardView.tsx', content);

console.log("Trend charts patched.");
