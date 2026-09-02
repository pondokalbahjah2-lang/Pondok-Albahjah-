import fs from 'fs';

let content = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf-8');

// Replace handleUploadSlip
const handleUploadSlipReplacement = `const handleUploadSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPejuangId) {
      alert('Silakan pilih pejuang sasaran upload slip ubar.');
      return;
    }
    if (!gdriveLink) {
      alert('Silakan masukkan Link Google Drive Slip Ubar.');
      return;
    }
    
    const pejuangObj = accounts.find((a) => a.id === selectedPejuangId);
    if (!pejuangObj) return;

    const finalFileName = fileName || \`Slip_Ubar_\${pejuangObj.name.replace(/\\s+/g, '_')}_\${periode.replace(/\\s+/g, '')}\`;

    const newSlip: SlipUbarRecord = {
      id: \`ubar-\${Date.now()}\`,
      pejuangId: pejuangObj.id,
      pejuangName: pejuangObj.name,
      periode,
      tanggalUpload: getLocalDateString(new Date()),
      fileName: finalFileName,
      fileUrl: gdriveLink,
      filePassword: singleFilePassword
    };

    onSaveSlipUbar([newSlip, ...slipUbarList]);
    setFileName('');
    setGdriveLink('');
    setSingleFilePassword('');
    alert(\`Link Dokumen Slip Ubar \${periode} untuk \${pejuangObj.name} berhasil disimpan.\`);
  };`;

content = content.replace(/const handleUploadSlip = \(e: React\.FormEvent\) => \{[\s\S]*?reader\.readAsDataURL\(singleFile\);\n  \};/, handleUploadSlipReplacement);

// Replace state variables
content = content.replace(/const \[singleFile, setSingleFile\] = useState<File \| null>\(null\);/, 'const [gdriveLink, setGdriveLink] = useState("");');

// Replace File Input with text input in UI
const fileInputReplacement = `              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Link Google Drive Slip Ubar
                </label>
                <input
                  type="url"
                  required
                  value={gdriveLink}
                  onChange={(e) => setGdriveLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>`;
content = content.replace(/<div>\s*<label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">\s*File Dokumen PDF\s*<\/label>[\s\S]*?<\/div>/, fileInputReplacement);

// Remove bulk upload feature UI
content = content.replace(/\{\/\* Bulk Upload Feature \*\/\}(.|\n)*?\{\/\* Document List & Download Table \*\/\}/, '{/* Document List & Download Table */}');

// Change label 'Nama File Dokumen PDF' to 'Nama Tampilan Slip Ubar'
content = content.replace(/Nama File Dokumen PDF/g, 'Nama Tampilan Slip Ubar');
content = content.replace(/placeholder="Contoh: Slip_Ubar_Agustus.pdf"/g, 'placeholder="Contoh: Slip Ubar Agustus"');

// Change download function in UI from creating an anchor to window.open
const downloadReplacement = `                      <button
                        onClick={() => {
                           window.open(item.fileUrl, '_blank');
                        }}
                        className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-md w-full sm:w-auto mt-2 sm:mt-0"
                        title="Unduh Slip Ubar"
                      >
                        <Download className="w-4 h-4" />
                        <span>Buka Link GDrive</span>
                      </button>`;
content = content.replace(/<button\s*onClick=\{[^}]*\}\s*className="py-2\.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1\.5 transition-colors shadow-md w-full sm:w-auto mt-2 sm:mt-0"(.|\n)*?<\/button>/, downloadReplacement);

// Add window.open directly since the original was:
// const link = document.createElement('a');
// link.href = item.fileUrl;
// link.download = item.fileName;
// link.click();

fs.writeFileSync('src/components/SlipUbarView.tsx', content, 'utf-8');
console.log('SlipUbarView.tsx patched successfully');
