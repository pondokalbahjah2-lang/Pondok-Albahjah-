const fs = require('fs');
let content = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf8');

const oldLogic = `  const handleSaveBulk = () => {
    if (stagedBulkFiles.some(s => !s.matchedPejuangId)) {
      alert("Ada slip yang belum dipetakan ke pejuang. Mohon lengkapi terlebih dahulu.");
      return;
    }

    const newSlips: SlipUbarRecord[] = stagedBulkFiles.map((s, index) => {
      const pejuang = pejuangAccounts.find(p => p.id === s.matchedPejuangId);
      return {
        id: \`ubar-bulk-\${index}-\${Date.now()}\`,
        pejuangId: s.matchedPejuangId,
        pejuangName: pejuang ? pejuang.name : 'Unknown Pejuang',
        periode: s.periode,
        tanggalUpload: getLocalDateString(new Date()),
        fileName: s.fileName,
        fileUrl: URL.createObjectURL(s.file),
        filePassword: s.filePassword,
      };
    });

    onSaveSlipUbar([...newSlips, ...slipUbarList]);
    setStagedBulkFiles([]);
    alert(\`Upload Sekaligus Berhasil! \${newSlips.length} dokumen slip ubar telah disimpan.\`);
  };`;

const newLogic = `  const handleSaveBulk = async () => {
    if (stagedBulkFiles.some(s => !s.matchedPejuangId)) {
      alert("Ada slip yang belum dipetakan ke pejuang. Mohon lengkapi terlebih dahulu.");
      return;
    }

    const readFileAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    try {
      const newSlips: SlipUbarRecord[] = await Promise.all(stagedBulkFiles.map(async (s, index) => {
        const pejuang = pejuangAccounts.find(p => p.id === s.matchedPejuangId);
        const base64Url = await readFileAsDataURL(s.file);
        return {
          id: \`ubar-bulk-\${index}-\${Date.now()}\`,
          pejuangId: s.matchedPejuangId,
          pejuangName: pejuang ? pejuang.name : 'Unknown Pejuang',
          periode: s.periode,
          tanggalUpload: getLocalDateString(new Date()),
          fileName: s.fileName,
          fileUrl: base64Url,
          filePassword: s.filePassword,
        };
      }));

      onSaveSlipUbar([...newSlips, ...slipUbarList]);
      setStagedBulkFiles([]);
      alert(\`Upload Sekaligus Berhasil! \${newSlips.length} dokumen slip ubar telah disimpan.\`);
    } catch (error) {
      alert('Terjadi kesalahan saat memproses file PDF.');
      console.error(error);
    }
  };`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/SlipUbarView.tsx', content);
