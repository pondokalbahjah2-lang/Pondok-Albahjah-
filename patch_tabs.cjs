const fs = require('fs');
let code = fs.readFileSync('src/components/CutiView.tsx', 'utf8');

code = code.replace(
  "{(currentUser.role === 'Admin' ? ['Semua', 'Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Sedang Cuti', 'Selesai', 'Rekap Kuota Cuti'] : ['Semua', 'Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Sedang Cuti', 'Selesai']).map((status) => (",
  "{(currentUser.role === 'Admin' || cutiApprovers.includes(currentUser.id) ? ['Semua', 'Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Sedang Cuti', 'Selesai', 'Rekap Kuota Cuti'] : ['Semua', 'Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Sedang Cuti', 'Selesai']).map((status) => ("
);

fs.writeFileSync('src/components/CutiView.tsx', code);
console.log('Patched CutiView tabs');
