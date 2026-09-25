with open("src/components/SuratTeguranView.tsx", "r") as f:
    content = f.read()

modal_new = """      {showPKWTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Update SK & PKWT Pejuang</span>
              </h3>
              <button
                onClick={() => setShowPKWTModal(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                if (!targetPkwtId || !onUpdateAccount) return;
                const acc = pejuangAccounts.find(a => a.id === targetPkwtId);
                if (acc) {
                  onUpdateAccount({
                    ...acc,
                    suratKeputusanUrl: pkwtSKUrl,
                    pkwtStart,
                    pkwtEnd
                  });
                  alert(`Data SK & PKWT untuk ${acc.name} berhasil diperbarui.`);
                  setShowPKWTModal(false);
                }
            }} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilih Pejuang
                </label>
                <select
                  required
                  value={targetPkwtId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setTargetPkwtId(id);
                    const acc = pejuangAccounts.find(a => a.id === id);
                    if (acc) {
                      setPkwtSKUrl(acc.suratKeputusanUrl || '');
                      setPkwtStart(acc.pkwtStart || '');
                      setPkwtEnd(acc.pkwtEnd || '');
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="">-- Pilih Pejuang --</option>
                  {pejuangAccounts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.subDivisi})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link GDrive SK
                </label>
                <input
                  type="url"
                  value={pkwtSKUrl}
                  onChange={(e) => setPkwtSKUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mulai PKWT
                </label>
                <input
                  type="date"
                  value={pkwtStart}
                  onChange={(e) => setPkwtStart(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Akhir PKWT
                </label>
                <input
                  type="date"
                  value={pkwtEnd}
                  onChange={(e) => setPkwtEnd(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Simpan & Update Berkas
              </button>
            </form>
          </div>
        </div>
      )}
"""

if modal_new not in content:
    idx = content.rfind("    </div>\n  );\n};")
    if idx != -1:
        content = content[:idx] + modal_new + content[idx:]
        with open("src/components/SuratTeguranView.tsx", "w") as f:
            f.write(content)
