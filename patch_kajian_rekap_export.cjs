const fs = require('fs');
let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

const exportBlock = `  const handleDownloadExcel = () => {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const data = filteredRecords.map(r => ({
      'Tanggal': r.date,
      'Nama Pejuang': r.pejuangName,
      'Sub Divisi': r.subDivisi,
      'Kajian': r.kajianName,
      'Mode': r.mode,
      'Link Hadir': r.attendancePhotoUrl || '-',
      'Link Catatan': r.statusValidasi === 'Ditolak' ? 'Tidak Ada' : (r.notesPhotoUrl || '-')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kajian");
    XLSX.writeFile(wb, \`Laporan_Kajian_\${filterStartDate}_sd_\${filterEndDate}.xlsx\`);
  };

  const handleDownloadPDF = () => {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const doc = new jsPDF('landscape');
    doc.text(\`Laporan Absensi Kajian Buya Yahya (\${filterStartDate} s/d \${filterEndDate})\`, 14, 15);
    
    const tableData = filteredRecords.map(r => [
      r.date, r.pejuangName, r.subDivisi, r.kajianName, r.mode, r.attendancePhotoUrl ? 'Ada' : '-', r.statusValidasi === 'Ditolak' ? 'Tidak Ada' : (r.notesPhotoUrl ? 'Ada' : '-')
    ]);

    autoTable(doc, {
      startY: 20,
      head: [['Tanggal', 'Nama Pejuang', 'Sub Divisi', 'Kajian', 'Mode', 'Link Hadir', 'Link Catatan']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save(\`Laporan_Kajian_\${filterStartDate}_sd_\${filterEndDate}.pdf\`);
  };`;

const newExportBlock = `  const generateSummary = (records: KajianRecord[]) => {
    const summary: Record<string, any> = {};
    records.forEach(r => {
      const pn = r.pejuangName || 'Unknown';
      if (!summary[pn]) {
        summary[pn] = {
          'Nama Pejuang': pn,
          'Sub Divisi': r.subDivisi || '-',
          'Total Absen': 0,
          'Total Catatan': 0,
          'Tafsir (Offline)': 0,
          'Tafsir (Offline) Catatan': 0,
          'Tafsir (Offline) Tanpa Catatan': 0,
          'Tafsir (Online)': 0,
          'Tafsir (Online) Catatan': 0,
          'Tafsir (Online) Tanpa Catatan': 0,
          'Mukhtasor (Offline)': 0,
          'Mukhtasor (Offline) Catatan': 0,
          'Mukhtasor (Offline) Tanpa Catatan': 0,
          'Mukhtasor (Online)': 0,
          'Mukhtasor (Online) Catatan': 0,
          'Mukhtasor (Online) Tanpa Catatan': 0,
          'Al-Hikam (Offline)': 0,
          'Al-Hikam (Offline) Catatan': 0,
          'Al-Hikam (Offline) Tanpa Catatan': 0,
          'Al-Hikam (Online)': 0,
          'Al-Hikam (Online) Catatan': 0,
          'Al-Hikam (Online) Tanpa Catatan': 0
        };
      }
      
      summary[pn]['Total Absen'] += 1;
      const hasCatatan = r.statusValidasi !== 'Ditolak' && !!r.notesPhotoUrl;
      if (hasCatatan) summary[pn]['Total Catatan'] += 1;
  
      let kName = r.kajianName || '';
      let isOffline = r.mode === 'Offline';
      let isTafsir = kName.includes('Tafsir');
      let isMukhtasor = kName.includes('Mukhtasor');
      let isHikam = kName.includes('Al-Hikam');
  
      if (isTafsir) {
          if (isOffline) {
              summary[pn]['Tafsir (Offline)'] += 1;
              if (hasCatatan) summary[pn]['Tafsir (Offline) Catatan'] += 1;
              else summary[pn]['Tafsir (Offline) Tanpa Catatan'] += 1;
          } else {
              summary[pn]['Tafsir (Online)'] += 1;
              if (hasCatatan) summary[pn]['Tafsir (Online) Catatan'] += 1;
              else summary[pn]['Tafsir (Online) Tanpa Catatan'] += 1;
          }
      } else if (isMukhtasor) {
          if (isOffline) {
              summary[pn]['Mukhtasor (Offline)'] += 1;
              if (hasCatatan) summary[pn]['Mukhtasor (Offline) Catatan'] += 1;
              else summary[pn]['Mukhtasor (Offline) Tanpa Catatan'] += 1;
          } else {
              summary[pn]['Mukhtasor (Online)'] += 1;
              if (hasCatatan) summary[pn]['Mukhtasor (Online) Catatan'] += 1;
              else summary[pn]['Mukhtasor (Online) Tanpa Catatan'] += 1;
          }
      } else if (isHikam) {
          if (isOffline) {
              summary[pn]['Al-Hikam (Offline)'] += 1;
              if (hasCatatan) summary[pn]['Al-Hikam (Offline) Catatan'] += 1;
              else summary[pn]['Al-Hikam (Offline) Tanpa Catatan'] += 1;
          } else {
              summary[pn]['Al-Hikam (Online)'] += 1;
              if (hasCatatan) summary[pn]['Al-Hikam (Online) Catatan'] += 1;
              else summary[pn]['Al-Hikam (Online) Tanpa Catatan'] += 1;
          }
      }
    });
  
    return Object.values(summary).sort((a: any, b: any) => a['Nama Pejuang'].localeCompare(b['Nama Pejuang']));
  };

  const handleDownloadExcel = () => {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const data = filteredRecords.map(r => ({
      'Tanggal': r.date,
      'Nama Pejuang': r.pejuangName,
      'Sub Divisi': r.subDivisi,
      'Kajian': r.kajianName,
      'Mode': r.mode,
      'Link Hadir': r.attendancePhotoUrl || '-',
      'Link Catatan': r.statusValidasi === 'Ditolak' ? 'Tidak Ada' : (r.notesPhotoUrl || '-')
    }));
    
    const summaryData = generateSummary(filteredRecords);

    const wsData = XLSX.utils.json_to_sheet(data);
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsData, "Kajian");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Rekapitulasi");
    
    XLSX.writeFile(wb, \`Laporan_Kajian_\${filterStartDate}_sd_\${filterEndDate}.xlsx\`);
  };

  const handleDownloadPDF = () => {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const doc = new jsPDF('landscape');
    
    // First Page: Raw Data
    doc.text(\`Laporan Absensi Kajian Buya Yahya (\${filterStartDate} s/d \${filterEndDate})\`, 14, 15);
    
    const tableData = filteredRecords.map(r => [
      r.date, r.pejuangName, r.subDivisi, r.kajianName, r.mode, r.attendancePhotoUrl ? 'Ada' : '-', r.statusValidasi === 'Ditolak' ? 'Tidak Ada' : (r.notesPhotoUrl ? 'Ada' : '-')
    ]);

    autoTable(doc, {
      startY: 20,
      head: [['Tanggal', 'Nama Pejuang', 'Sub Divisi', 'Kajian', 'Mode', 'Link Hadir', 'Link Catatan']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });
    
    // Second Page: Summary
    doc.addPage();
    doc.text(\`Rekapitulasi Absensi Kajian (\${filterStartDate} s/d \${filterEndDate})\`, 14, 15);
    
    const summaryData = generateSummary(filteredRecords);
    const summaryHeaders = [
      'Nama', 'Total Hadir', 'Total Catat',
      'Tafsir (Off)', 'Tafsir (On)',
      'Mukhtasor (Off)', 'Mukhtasor (On)',
      'Al-Hikam (Off)', 'Al-Hikam (On)'
    ];
    
    // To fit in PDF, we simplify the summary table slightly or split it. Let's do a dense table.
    const summaryTableData = summaryData.map((s: any) => [
      s['Nama Pejuang'],
      s['Total Absen'],
      s['Total Catatan'],
      \`\${s['Tafsir (Offline)']} (\${s['Tafsir (Offline) Catatan']}C / \${s['Tafsir (Offline) Tanpa Catatan']}T)\`,
      \`\${s['Tafsir (Online)']} (\${s['Tafsir (Online) Catatan']}C / \${s['Tafsir (Online) Tanpa Catatan']}T)\`,
      \`\${s['Mukhtasor (Offline)']} (\${s['Mukhtasor (Offline) Catatan']}C / \${s['Mukhtasor (Offline) Tanpa Catatan']}T)\`,
      \`\${s['Mukhtasor (Online)']} (\${s['Mukhtasor (Online) Catatan']}C / \${s['Mukhtasor (Online) Tanpa Catatan']}T)\`,
      \`\${s['Al-Hikam (Offline)']} (\${s['Al-Hikam (Offline) Catatan']}C / \${s['Al-Hikam (Offline) Tanpa Catatan']}T)\`,
      \`\${s['Al-Hikam (Online)']} (\${s['Al-Hikam (Online) Catatan']}C / \${s['Al-Hikam (Online) Tanpa Catatan']}T)\`
    ]);

    autoTable(doc, {
      startY: 20,
      head: [summaryHeaders],
      body: summaryTableData,
      theme: 'grid',
      headStyles: { fillColor: [46, 204, 113] },
      styles: { fontSize: 7, cellPadding: 1 },
      columnStyles: {
        0: { cellWidth: 30 }
      }
    });

    doc.save(\`Laporan_Kajian_\${filterStartDate}_sd_\${filterEndDate}.pdf\`);
  };`;

if(code.indexOf('const generateSummary') === -1) {
    code = code.replace(exportBlock, newExportBlock);
    fs.writeFileSync('src/components/KajianView.tsx', code);
    console.log('Export patched successfully');
}
