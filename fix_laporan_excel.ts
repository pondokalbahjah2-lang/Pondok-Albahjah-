import fs from 'fs';

let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf-8');

// Replace handleExportAllExcel
const generateExcelCode = `
  const handleExportAllExcel = () => {
    if (!reportMonth) {
      alert("Pilih bulan terlebih dahulu");
      return;
    }

    const year = parseInt(reportMonth.split('-')[0]);
    const month = parseInt(reportMonth.split('-')[1]);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Create base data for each user
    const reportDataMasuk: any[] = [];
    const reportDataPulang: any[] = [];

    // Use accounts instead of pejuangAccounts to include Admin
    accounts.forEach((p, idx) => {
      // Find user schedule
      const userSchedule = (schedules || []).find((s: any) => s.targetId === p.id || s.targetId === p.subDivisi);
      const hariKerja = userSchedule?.hariKerja || ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const hariMap = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

      let totalHadir = 0;
      let totalTelat = 0;
      let totalIzin = 0; // using Exit Permissions or "Izin" status
      let totalCuti = 0;
      let totalSakit = 0;
      let totalLibur = 0;

      const rowMasuk: any = {
        'No': idx + 1,
        'Nama': p.name,
        'Peran': p.role,
        'Amanah': p.amanah,
      };
      
      const rowPulang: any = {
        'No': idx + 1,
        'Nama': p.name,
        'Peran': p.role,
        'Amanah': p.amanah,
      };

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = \`\${year}-\${month.toString().padStart(2, '0')}-\${d.toString().padStart(2, '0')}\`;
        const dayOfWeek = new Date(year, month - 1, d).getDay();
        const namaHari = hariMap[dayOfWeek];

        let valMasuk = '-';
        let valPulang = '-';

        // Check Leave (Cuti)
        const isCuti = leaveRequests.some(l => 
          l.pejuangId === p.id && 
          l.status === 'Disetujui' && 
          l.tanggalMulai <= dateStr && 
          l.tanggalSelesai >= dateStr
        );

        // Check Attendance
        const att = attendance.find(a => a.pejuangId === p.id && a.date === dateStr);

        // Check Izin Keluar (as Izin)
        const isIzin = exitPermissions.some(e =>
           e.pejuangId === p.id &&
           e.tanggalKeluar <= dateStr &&
           e.tanggalIzinSampai >= dateStr
        );

        if (isCuti) {
          valMasuk = 'Cuti';
          valPulang = 'Cuti';
          totalCuti++;
        } else if (att?.status === 'Sakit') {
          valMasuk = 'Sakit';
          valPulang = 'Sakit';
          totalSakit++;
        } else if (att?.status === 'Libur' || !hariKerja.includes(namaHari)) {
          valMasuk = 'Libur';
          valPulang = 'Libur';
          totalLibur++;
        } else if (isIzin) {
           valMasuk = att?.time || 'Izin';
           valPulang = att?.timePulang || 'Izin';
           totalIzin++;
        } else if (att) {
          if (att.status === 'Hadir') {
            totalHadir++;
          } else if (att.status === 'Terlambat') {
            totalTelat++;
          }
          valMasuk = att.time || '-';
          valPulang = att.timePulang || '-';
        }

        rowMasuk[d.toString()] = valMasuk;
        rowPulang[d.toString()] = valPulang;
      }

      const totals = {
        'Total Hadir': totalHadir,
        'Total Telat': totalTelat,
        'Total Izin': totalIzin,
        'Total Cuti': totalCuti,
        'Total Sakit': totalSakit,
        'Total Libur': totalLibur,
      };

      Object.assign(rowMasuk, totals);
      Object.assign(rowPulang, totals);

      reportDataMasuk.push(rowMasuk);
      reportDataPulang.push(rowPulang);
    });

    const worksheetMasuk = XLSX.utils.json_to_sheet(reportDataMasuk);
    const worksheetPulang = XLSX.utils.json_to_sheet(reportDataPulang);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheetMasuk, "Absen Masuk");
    XLSX.utils.book_append_sheet(workbook, worksheetPulang, "Absen Pulang");
    
    XLSX.writeFile(workbook, \`Laporan_Seluruh_Anggota_\${reportMonth}.xlsx\`);
  };
`;

const regexExportExcel = /const handleExportAllExcel = \(\) => \{[\s\S]*?XLSX\.writeFile\(workbook, "Laporan_Rekapitulasi_Pejuang\.xlsx"\);\s*\};/;
content = content.replace(regexExportExcel, generateExcelCode.trim());

fs.writeFileSync('src/components/LaporanView.tsx', content);
