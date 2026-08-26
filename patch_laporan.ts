import fs from 'fs';
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf-8');

// Add import * as XLSX from 'xlsx';
if (!content.includes("import * as XLSX from 'xlsx';")) {
  content = content.replace(
    /import jsPDF from 'jspdf';/,
    "import jsPDF from 'jspdf';\nimport * as XLSX from 'xlsx';"
  );
}

const replacement = `
  const handleExportAllExcel = () => {
    const tableData = pejuangAccounts.map((p, idx) => {
      const att = attendance.filter(a => a.pejuangId === p.id);
      const ex = exitPermissions.filter(e => e.pejuangId === p.id);
      const lv = leaveRequests.filter(l => l.pejuangId === p.id);
      return {
        'No': idx + 1,
        'Nama': p.name,
        'Sub Divisi': p.subDivisi,
        'Hadir': att.filter(a => a.status === 'Hadir').length,
        'Terlambat': att.filter(a => a.status === 'Terlambat').length,
        'Sakit': att.filter(a => a.status === 'Sakit').length,
        'Izin Keluar': ex.length,
        'Cuti': lv.length
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pejuang");
    XLSX.writeFile(workbook, "Laporan_Rekapitulasi_Pejuang.xlsx");
  };
`;

content = content.replace(
  /const handleExportAllExcel = \(\) => \{\s*alert\('Export to Excel di-download di sini\.'\);\s*\};/,
  replacement.trim()
);

fs.writeFileSync('src/components/LaporanView.tsx', content);
