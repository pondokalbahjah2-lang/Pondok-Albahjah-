import re

with open("src/components/SuratTeguranView.tsx", "r") as f:
    content = f.read()

# Add states for PKWT
content = content.replace("const [showAddModal, setShowAddModal] = useState(false);", "const [showAddModal, setShowAddModal] = useState(false);\n  const [showPKWTModal, setShowPKWTModal] = useState(false);\n  const [targetPkwtId, setTargetPkwtId] = useState('');\n  const [pkwtSKUrl, setPkwtSKUrl] = useState('');\n  const [pkwtStart, setPkwtStart] = useState('');\n  const [pkwtEnd, setPkwtEnd] = useState('');\n  const [updateMode, setUpdateMode] = useState(0);\n")

# Add button
btn_target = r"(\{currentUser\.role === 'Admin' && \(\s*<button\s*onClick=\{\(\) => setShowAddModal\(true\)\}[\s\S]*?<\/button>\s*\)\})"
btn_new = r"""{currentUser.role === 'Admin' && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Surat Teguran / SP</span>
            </button>
            <button
              onClick={() => setShowPKWTModal(true)}
              className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Update Data SK & PKWT</span>
            </button>
          </div>
        )}"""
content = re.sub(btn_target, btn_new, content)

# Add Modal
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
content = content.replace("</div>\n    </div>\n  );\n};", modal_new + "    </div>\n  );\n};")

with open("src/components/SuratTeguranView.tsx", "w") as f:
    f.write(content)
