const fs = require('fs');
let code = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');

// Add import
code = code.replace(
  "import { getLocalDateString } from '../utils/dateUtils';",
  "import { getLocalDateString } from '../utils/dateUtils';\nimport { uploadPDFToDrive } from '../utils/googleDrive';"
);

// We need to modify handleGeneratePDF to support saving to drive
// Actually I will create a new function `handleSaveToDrive` which generates the PDF and uploads it.

const driveFunction = `  const handleSaveToDrive = async (rec: ExitPermissionRecord) => {
    if (!suratIzinTemplateUrl) {
      alert("Template Surat Izin belum diunggah. Silakan hubungi Admin.");
      return;
    }
    
    // Copy the PDF generation logic
    const doc = new jsPDF('p', 'mm', 'a5');
    doc.addImage(suratIzinTemplateUrl, 'JPEG', 0, 0, 148, 210);
    doc.setFontSize(10);
    const startX = 48;
    doc.text(rec.pejuangName, startX, 53.0);
    doc.text(rec.subDivisi || '-', startX, 60.0);
    const hajatSplit = doc.splitTextToSize(rec.alasan, 85);
    doc.text(hajatSplit[0], startX, 67.0);
    doc.text(\`\${rec.tanggalKeluar} / \${rec.jamKeluar}\`, startX, 74.0);
    doc.text(\`\${rec.tanggalIzinSampai} / \${rec.jamHarusKembali}\`, startX, 81.0);
    
    const printAtasanName = kepalaPondokName || 'Ust M Hamdani, B.Sc';
    doc.setFontSize(9);
    doc.text(doc.splitTextToSize(printAtasanName, 40), 37, 144.5, { align: 'center' });
    doc.text(doc.splitTextToSize(rec.pejuangName, 40), 111, 144.5, { align: 'center' });
    
    const pdfBlob = doc.output('blob');
    const filename = \`Surat_Izin_Keluar_\${rec.pejuangName.replace(/\\s+/g, '_')}_\${rec.tanggalKeluar}.pdf\`;
    
    try {
      if (confirm(\`Apakah Anda ingin menyimpan "\${filename}" ke Google Drive Anda?\`)) {
        alert("Sedang mengunggah ke Google Drive... Mohon tunggu.");
        const fileId = await uploadPDFToDrive(pdfBlob, filename);
        alert(\`Berhasil disimpan ke Google Drive dengan ID: \${fileId}\`);
      }
    } catch (err: any) {
      alert('Gagal menyimpan ke Google Drive: ' + err.message);
    }
  };
`;

code = code.replace("const handleGeneratePDF = async", driveFunction + "\n  const handleGeneratePDF = async");

// Now we need to find where handleGeneratePDF is called and add the Drive button next to it.
const buttonTarget = `<button
                          onClick={() => handleGeneratePDF(rec)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] flex items-center space-x-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak PDF</span>
                        </button>`;

const newButtons = `<div className="flex space-x-2"><button
                          onClick={() => handleGeneratePDF(rec)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] flex items-center space-x-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak PDF</span>
                        </button>
                        <button
                          onClick={() => handleSaveToDrive(rec)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Drive</span>
                        </button></div>`;
                        
code = code.replaceAll(buttonTarget, newButtons);

fs.writeFileSync('src/components/IzinKeluarView.tsx', code);
