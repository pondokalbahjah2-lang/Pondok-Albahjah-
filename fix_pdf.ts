import fs from 'fs';

let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf-8');

// Fix import
content = content.replace(/import 'jspdf-autotable';/, "import autoTable from 'jspdf-autotable';");

const generatePdfCode = `
  const handleExportAllPDF = () => {
    if (!reportMonth) {
      alert("Pilih bulan terlebih dahulu");
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');
    doc.setFontSize(12);
    doc.text(\`Laporan Rekapitulasi Kehadiran - \${reportMonth}\`, 14, 15);

    const year = parseInt(reportMonth.split('-')[0]);
    const month = parseInt(reportMonth.split('-')[1]);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Generate headers
    const headRow = ['No', 'Nama', 'Amanah'];
    for(let d = 1; d <= daysInMonth; d++) headRow.push(d.toString());
    headRow.push('H', 'T', 'I', 'C', 'S', 'L'); // Abbreviations for Totals to save space

    const bodyMasuk: any[] = [];
    const bodyPulang: any[] = [];

    pejuangAccounts.forEach((p, idx) => {
      const userSchedule = (schedules || []).find((s: any) => s.targetId === p.id || s.targetId === p.subDivisi);
      const hariKerja = userSchedule?.hariKerja || ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const hariMap = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

      let totalHadir = 0, totalTelat = 0, totalIzin = 0, totalCuti = 0, totalSakit = 0, totalLibur = 0;

      const rowM: any[] = [idx + 1, p.name, p.amanah];
      const rowP: any[] = [idx + 1, p.name, p.amanah];

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = \`\${year}-\${month.toString().padStart(2, '0')}-\${d.toString().padStart(2, '0')}\`;
        const dayOfWeek = new Date(year, month - 1, d).getDay();
        const namaHari = hariMap[dayOfWeek];

        let valM = '-';
        let valP = '-';

        const isCuti = leaveRequests.some(l => l.pejuangId === p.id && l.status === 'Disetujui' && l.tanggalMulai <= dateStr && l.tanggalSelesai >= dateStr);
        const isIzin = exitPermissions.some(e => e.pejuangId === p.id && e.tanggalKeluar <= dateStr && e.tanggalIzinSampai >= dateStr);
        const att = attendance.find(a => a.pejuangId === p.id && a.date === dateStr);

        if (isCuti) {
          valM = 'C'; valP = 'C'; totalCuti++;
        } else if (att?.status === 'Sakit') {
          valM = 'S'; valP = 'S'; totalSakit++;
        } else if (att?.status === 'Libur' || !hariKerja.includes(namaHari)) {
          valM = 'L'; valP = 'L'; totalLibur++;
        } else if (isIzin) {
          valM = att?.time || 'I'; valP = att?.timePulang || 'I'; totalIzin++;
        } else if (att) {
          if (att.status === 'Hadir') totalHadir++;
          else if (att.status === 'Terlambat') totalTelat++;
          valM = att.time || '-'; valP = att.timePulang || '-';
        }

        rowM.push(valM);
        rowP.push(valP);
      }

      rowM.push(totalHadir, totalTelat, totalIzin, totalCuti, totalSakit, totalLibur);
      rowP.push(totalHadir, totalTelat, totalIzin, totalCuti, totalSakit, totalLibur);

      bodyMasuk.push(rowM);
      bodyPulang.push(rowP);
    });

    doc.setFontSize(10);
    doc.text("Absen Masuk", 14, 25);
    autoTable(doc, {
      startY: 28,
      head: [headRow],
      body: bodyMasuk,
      theme: 'grid',
      styles: { fontSize: 5, cellPadding: 0.5, overflow: 'linebreak' },
      headStyles: { fillColor: [41, 128, 185], fontSize: 5 },
      columnStyles: { 0: { cellWidth: 5 }, 1: { cellWidth: 20 }, 2: { cellWidth: 15 } }
    });
    
    doc.addPage();
    doc.setFontSize(12);
    doc.text(\`Laporan Rekapitulasi Kehadiran - \${reportMonth}\`, 14, 15);
    doc.setFontSize(10);
    doc.text("Absen Pulang", 14, 25);
    
    autoTable(doc, {
      startY: 28,
      head: [headRow],
      body: bodyPulang,
      theme: 'grid',
      styles: { fontSize: 5, cellPadding: 0.5, overflow: 'linebreak' },
      headStyles: { fillColor: [41, 128, 185], fontSize: 5 },
      columnStyles: { 0: { cellWidth: 5 }, 1: { cellWidth: 20 }, 2: { cellWidth: 15 } }
    });

    doc.save(\`Laporan_Keseluruhan_Pejuang_\${reportMonth}.pdf\`);
  };
`;

const regexExportPdf = /const handleExportAllPDF = \(\) => \{[\s\S]*?doc\.save\('Laporan_Keseluruhan_Pejuang\.pdf'\);\s*\};/;
content = content.replace(regexExportPdf, generatePdfCode.trim());

fs.writeFileSync('src/components/LaporanView.tsx', content);
