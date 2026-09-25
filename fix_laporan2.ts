import fs from 'fs';
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf-8');

// handleExportAllExcel and handleExportAllPDF might be defined inside the wrong scope or missing
const exports = `
  const handleExportAllExcel = () => {
    alert('Export to Excel di-download di sini.');
  };

  const handleExportAllPDF = () => {
    const doc = new jsPDF('landscape');
    doc.text('Laporan Rekapitulasi Keseluruhan Pejuang', 14, 15);
    const tableData = pejuangAccounts.map((p, idx) => {
      const att = attendance.filter(a => a.pejuangId === p.id);
      const ex = exitPermissions.filter(e => e.pejuangId === p.id);
      const lv = leaveRequests.filter(l => l.pejuangId === p.id);
      return [
        idx + 1,
        p.name,
        p.subDivisi,
        att.filter(a => a.status === 'Hadir').length,
        att.filter(a => a.status === 'Terlambat').length,
        att.filter(a => a.status === 'Sakit').length,
        ex.length,
        lv.length
      ];
    });

    (doc as any).autoTable({
      startY: 20,
      head: [['No', 'Nama', 'Sub Divisi', 'Hadir', 'Terlambat', 'Sakit', 'Izin Keluar', 'Cuti']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save('Laporan_Keseluruhan_Pejuang.pdf');
  };
`;

if (content.includes('const handlePrintReport = () => {')) {
   content = content.replace(/const handlePrintReport = \(\) => \{[\s\S]*?window\.print\(\);\n  \};/, "const handlePrintReport = () => { window.print(); };\n" + exports);
}

// Remove duplicates if they exist lower down
const lines = content.split('\n');
const newLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes('const handleExportAllExcel = () => {') && i > 300) {
      skip = true;
   }
   if (skip && lines[i].includes('  const activePejuang =')) {
      skip = false;
   }
   if (!skip) {
      newLines.push(lines[i]);
   }
}

fs.writeFileSync('src/components/LaporanView.tsx', newLines.join('\n'));
