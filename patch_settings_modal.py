import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

sk_ui = """
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Link Surat Keputusan (SK)</label>
                <input
                  type="url"
                  value={newSuratKeputusanUrl}
                  onChange={(e) => setNewSuratKeputusanUrl(e.target.value)}
                  placeholder="Link Google Drive SK..."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Mulai PKWT</label>
                  <input
                    type="date"
                    value={newPkwtStart}
                    onChange={(e) => setNewPkwtStart(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Akhir PKWT</label>
                  <input
                    type="date"
                    value={newPkwtEnd}
                    onChange={(e) => setNewPkwtEnd(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>
"""

# Insert before "Simpan Data Pejuang" button in both modals
target = r"(<div className=\"pt-2\">\s*<button\s*type=\"submit\")"
content = re.sub(target, sk_ui + r"\1", content)

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
