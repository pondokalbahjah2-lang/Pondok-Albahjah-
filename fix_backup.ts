import fs from 'fs';

// Let's completely replace everything below `      )}` to the end of the file.
// We know the modal for Manhajiyyah should be there, and then the backup tab.
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

// Find the index of `{/* Modal Manhajiyyah */}`
const modalIndex = content.indexOf('{/* Modal Manhajiyyah */}');

let newTail = `
      {/* Modal Manhajiyyah */}
      {showManhajiyyahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">
                {editingManhajiyyahId ? 'Edit Pasal Manhajiah' : 'Tambah Pasal Manhajiah Baru'}
              </h3>
              <button
                onClick={() => setShowManhajiyyahModal(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveManhajiyyah} className="space-y-4 my-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bab (Opsional)</label>
                  <input
                    type="text"
                    value={manBab}
                    onChange={(e) => setManBab(e.target.value)}
                    placeholder="Contoh: I / II / III"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori / Topik</label>
                  <input
                    type="text"
                    value={manCategory}
                    onChange={(e) => setManCategory(e.target.value)}
                    placeholder="Contoh: Kedisiplinan"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No Pasal</label>
                  <input
                    type="text"
                    required
                    value={manPasalNumber}
                    onChange={(e) => setManPasalNumber(e.target.value)}
                    placeholder="Contoh: 1 / 1A"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-8">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Pasal</label>
                  <input
                    type="text"
                    required
                    value={manTitle}
                    onChange={(e) => setManTitle(e.target.value)}
                    placeholder="Contoh: Kewajiban Mengajar"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Isi Pasal</label>
                <textarea
                  required
                  rows={8}
                  value={manContent}
                  onChange={(e) => setManContent(e.target.value)}
                  placeholder="Ketik isi / detail pasal di sini..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Simpan Pasal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab Backup */}
      {activeTab === 'backup' && isAdmin && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <DownloadCloud className="w-4 h-4 text-emerald-600" />
              <span>Backup Data Sistem</span>
            </h2>
            <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-2">Backup Data Saat Ini</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Sistem otomatis terhubung ke Firestore.
                </p>
              </div>
              <button 
                onClick={() => alert('Data telah otomatis tersimpan aman di Cloud Firestore Database.')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Status Backup: Aman (Auto-Sync)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
`;

content = content.substring(0, modalIndex) + newTail;
fs.writeFileSync('src/components/SettingsView.tsx', content);
console.log("Restored tail of file");
