import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

// The error was caused by a malformed replacement for manhajiah.
// Let's find what got messed up.
const badMatch = `      )}

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
      )};`;

// It seems I added `)};` instead of `)}` or something?
// Wait, looking at the output:
// 888:      </div>
// 889:    </div>
// 890:  )};
// 891:                  const url = URL.createObjectURL(blob);
// Ah, the regex `      \{activeTab === 'manhajiah' && \([\s\S]*?\}\)` captured all the way to some other `})` !
