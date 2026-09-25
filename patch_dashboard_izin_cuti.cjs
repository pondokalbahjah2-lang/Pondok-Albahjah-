const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

// 1. Fix totalSedangCuti in metrics
const metricsStr = `    let totalSedangCuti = 0;
    for (let i = 0; i < leaveRequests.length; i++) {
      const status = leaveRequests[i].status;
      if (status === 'Menunggu Persetujuan') totalMengajukanCuti++;
      else if (status === 'Sedang Cuti') totalSedangCuti++;
    }`;
const newMetricsStr = `    let totalSedangCuti = 0;
    const todayStr = getLocalDateString(new Date());
    for (let i = 0; i < leaveRequests.length; i++) {
      const status = leaveRequests[i].status;
      if (status === 'Menunggu Persetujuan') totalMengajukanCuti++;
      else if (status === 'Disetujui' && leaveRequests[i].tanggalMulai <= todayStr && leaveRequests[i].tanggalSelesai >= todayStr) totalSedangCuti++;
      else if (status === 'Sedang Cuti') totalSedangCuti++; // Keep for backward compatibility if any
    }`;
content = content.replace(metricsStr, newMetricsStr);

// 2. Fix izinList in todayStats
const izinListStr = `    const izinList = todayAttendance.filter(a => a.status === 'Izin');`;
const newIzinListStr = `    const izinList = todayAttendance.filter(a => a.status === 'Izin' || a.status === 'Izin Tidak Masuk');`;
content = content.replace(izinListStr, newIzinListStr);

// 3. Fix sedangCutiList in todayStats
const sedangCutiListStr = `    const sedangCutiList = leaveRequests.filter(l => l.status === 'Sedang Cuti');`;
const newSedangCutiListStr = `    const sedangCutiList = leaveRequests.filter(l => l.status === 'Sedang Cuti' || (l.status === 'Disetujui' && l.tanggalMulai <= todayStr && l.tanggalSelesai >= todayStr));`;
content = content.replace(sedangCutiListStr, newSedangCutiListStr);

fs.writeFileSync('src/components/DashboardView.tsx', content);
