const fs = require('fs');
let code = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf8');

const anchor = `    </div>
  );
};`;

const printContainer = `      {/* Hidden Print View */}
      {printData && (
        <div className="hidden print:flex fixed inset-0 z-[9999] bg-white text-black p-8 flex-col items-center justify-start">
          <div className="w-full max-w-4xl border-b-2 border-black pb-4 mb-6">
            <h1 className="text-3xl font-black text-center mb-2 uppercase">Slip Ubar - {printData.pejuangName}</h1>
            <h2 className="text-xl font-bold text-center text-gray-700">Periode: {printData.periode}</h2>
            <p className="text-sm text-center text-gray-500 mt-2">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          </div>
          
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            {printData.fileUrl.match(/\\.(jpeg|jpg|gif|png|webp|bmp)(\\?.*)?$/i) || printData.fileUrl.includes('firebasestorage') ? (
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

code = code.replace(anchor, printContainer);
fs.writeFileSync('src/components/SlipUbarView.tsx', code);
console.log('Fixed print view');
