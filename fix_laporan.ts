import fs from 'fs';
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf-8');

// Fix missing variables in PDF generation
content = content.replace(
  /const userLeaves = leaveRequests.filter\(/,
  "const userSlipUbars = slipUbarList.filter((u) => u.pejuangId === activePejuang.id);\n  const userLeaves = leaveRequests.filter("
);

// Add missing handlePrintReport
const missingPrintReport = `
  const handlePrintReport = () => {
    window.print();
  };
`;
if (!content.includes('const handlePrintReport = () =>')) {
  content = content.replace(
    /const handleExportIndividualPDF = \(\) => \{/,
    missingPrintReport.trim() + '\n\n  const handleExportIndividualPDF = () => {'
  );
}

// Ensure handleExportAllExcel is there
const exportExcelMissing = `
  const handleExportAllExcel = () => {
    alert('Export to Excel will be generated here.');
  };
`;
if (!content.includes('const handleExportAllExcel = () =>')) {
  content = content.replace(
    /const handleExportAllPDF = \(\) => \{/,
    exportExcelMissing.trim() + '\n\n  const handleExportAllPDF = () => {'
  );
}

fs.writeFileSync('src/components/LaporanView.tsx', content);
