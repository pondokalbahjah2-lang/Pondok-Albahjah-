const fs = require('fs');
let code = fs.readFileSync('src/components/CutiView.tsx', 'utf8');

// Add import
code = code.replace(
  "import { getLocalDateString } from '../utils/dateUtils';",
  "import { getLocalDateString } from '../utils/dateUtils';\nimport { uploadPDFToDrive } from '../utils/googleDrive';"
);

const cutiTarget = `      const filename = \`Surat_Cuti_\${rec.pejuangName.replace(/s+/g, '_')}_\${rec.tanggalMulai}.pdf\`;
      doc.save(filename);
      alert('Surat Cuti berhasil diunduh sebagai PDF.');`;

const cutiReplace = `      const filename = \`Surat_Cuti_\${rec.pejuangName.replace(/\\s+/g, '_')}_\${rec.tanggalMulai}.pdf\`;
      doc.save(filename);
      alert('Surat Cuti berhasil diunduh sebagai PDF.');
      
      try {
        if (confirm(\`Apakah Anda ingin menyimpan "\${filename}" ke Google Drive Anda?\`)) {
          alert("Sedang mengunggah ke Google Drive... Mohon tunggu.");
          const pdfBlob = doc.output('blob');
          const fileId = await uploadPDFToDrive(pdfBlob, filename);
          alert(\`Berhasil disimpan ke Google Drive dengan ID: \${fileId}\`);
        }
      } catch (driveErr: any) {
        alert('Gagal menyimpan ke Google Drive: ' + driveErr.message);
      }
`;

code = code.replace(cutiTarget, cutiReplace);
fs.writeFileSync('src/components/CutiView.tsx', code);
