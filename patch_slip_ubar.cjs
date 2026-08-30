const fs = require('fs');
let code = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf8');

// 1. Add print state
code = code.replace(
  'const [revealError, setRevealError] = useState(\'\');',
  'const [revealError, setRevealError] = useState(\'\');\n  const [printData, setPrintData] = useState<SlipUbarRecord | null>(null);'
);

// 2. Add Cetak button
const btnAnchor = `<a
                        href={slip.fileUrl}
                        download={slip.fileName}
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />`;

const btnReplace = `<button
                        onClick={() => {
                          setPrintData(slip);
                          setTimeout(() => window.print(), 500);
                        }}
                        className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cetak</span>
                      </button>
                      <a
                        href={slip.fileUrl}
                        download={slip.fileName}
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />`;
code = code.replace(btnAnchor, btnReplace);

// 3. Import Printer icon
code = code.replace(
  'Key,',
  'Key,\n  Printer,'
);

// 4. Add Print Container at the very end of the component
const printContainer = `      </div>

      {/* Hidden Print View */}
      {printData && (
        <div className="hidden print:flex fixed inset-0 z-[9999] bg-white text-black p-8 flex-col items-center justify-start">
          <div className="w-full max-w-4xl border-b-2 border-black pb-4 mb-6">
            <h1 className="text-3xl font-black text-center mb-2 uppercase">Slip Ubar - {printData.pejuangName}</h1>
            <h2 className="text-xl font-bold text-center text-gray-700">Periode: {printData.periode}</h2>
            <p className="text-sm text-center text-gray-500 mt-2">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          </div>
          
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            {printData.fileUrl.match(/\\.(jpeg|jpg|gif|png|webp|bmp)$/i) || printData.fileUrl.includes('firebasestorage') ? (
              <img src={printData.fileUrl} alt="Slip Ubar" className="max-w-full max-h-[70vh] object-contain border-2 border-gray-200 p-2 rounded-lg" />
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-gray-400 rounded-xl">
                <p className="text-lg font-bold text-gray-600">File format tidak dapat dicetak langsung (kemungkinan PDF/ZIP).</p>
                <p className="text-sm text-gray-500 mt-2">Silakan unduh file melalui tombol Unduh Dokumen dan cetak secara manual.</p>
              </div>
            )}
          </div>
          <div className="w-full mt-auto pt-8 flex justify-between text-xs text-gray-400">
            <span>Sistem Manajemen Pejuang Al-Bahjah Cirebon 1</span>
            <span>Dokumen Rahasia & Pribadi</span>
          </div>
        </div>
      )}
    </div>
  );
};`;
code = code.replace(/      <\/div>\s*<\/div>\s*\);\s*};\s*$/g, printContainer);

fs.writeFileSync('src/components/SlipUbarView.tsx', code);
console.log('SlipUbarView patched with print view.');
