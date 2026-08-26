import fs from 'fs';
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf-8');

const newIndividualPDF = `
  const handleExportIndividualPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(\`Laporan Individu: \${activePejuang.name}\`, 14, 15);
    doc.setFontSize(11);
    doc.text(\`Sub Divisi: \${activePejuang.subDivisi}\`, 14, 22);
    doc.text(\`Amanah: \${activePejuang.amanah}\`, 14, 28);
    
    // Ringkasan
    doc.setFontSize(12);
    doc.text('Ringkasan Kinerja', 14, 40);
    const summaryData = [
      ['Hadir Tepat Waktu', totalHadir],
      ['Terlambat', totalTerlambat],
      ['Sakit', totalSakit],
      ['Izin Keluar', userExits.length],
      ['Cuti', userLeaves.length],
      ['Slip Ubar Uploaded', userSlipUbars.length],
    ];
    (doc as any).autoTable({
      startY: 45,
      head: [['Kategori', 'Total']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Log Presensi
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Log Presensi Harian', 14, finalY);
    const attBody = userAtt.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => [
      a.date,
      a.time,
      a.timePulang || '-',
      a.status,
      a.notes || '-'
    ]);
    (doc as any).autoTable({
      startY: finalY + 5,
      head: [['Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status', 'Keterangan']],
      body: attBody,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
    });

    // Izin Keluar
    finalY = (doc as any).lastAutoTable.finalY + 15;
    if (finalY > 250) { doc.addPage(); finalY = 20; }
    doc.text('Riwayat Izin Keluar', 14, finalY);
    const izinBody = userExits.map(e => [
      e.tanggalKeluar,
      e.tanggalIzinSampai,
      e.alasan,
      e.status
    ]);
    (doc as any).autoTable({
      startY: finalY + 5,
      head: [['Tgl Keluar', 'Tgl Kembali', 'Alasan', 'Status']],
      body: izinBody,
      theme: 'grid',
      headStyles: { fillColor: [142, 68, 173] },
    });

    // Slip Ubar
    finalY = (doc as any).lastAutoTable.finalY + 15;
    if (finalY > 250) { doc.addPage(); finalY = 20; }
    doc.text('Riwayat Slip Ubar', 14, finalY);
    const ubarBody = userSlipUbars.map(u => [
      u.periode,
      u.tanggalUpload,
      u.fileName
    ]);
    (doc as any).autoTable({
      startY: finalY + 5,
      head: [['Periode', 'Tanggal Upload', 'Nama File']],
      body: ubarBody,
      theme: 'grid',
      headStyles: { fillColor: [211, 84, 0] },
    });

    doc.save(\`Laporan_Pejuang_\${activePejuang.name.replace(/\\s+/g, '_')}.pdf\`);
  };
`;

content = content.replace(/const handleExportIndividualPDF = \(\) => \{[\s\S]*?\}\);[\s]*doc\.save\([^\)]*\);[\s]*\};/, newIndividualPDF.trim());

fs.writeFileSync('src/components/LaporanView.tsx', content);
