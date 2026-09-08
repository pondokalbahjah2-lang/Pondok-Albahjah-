import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

custom_ui = """                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Custom Jam Kerja Per Hari (Opsional)</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {schHariKerja.map(hari => (
                      <div key={hari} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="w-20 text-xs font-bold text-slate-700 dark:text-slate-200">{hari}</span>
                        <input
                          type="time"
                          value={customJamKerja[hari]?.masuk || ''}
                          onChange={(e) => setCustomJamKerja(prev => ({ ...prev, [hari]: { ...prev[hari], masuk: e.target.value } }))}
                          className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                          placeholder="Jam Masuk"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="time"
                          value={customJamKerja[hari]?.pulang || ''}
                          onChange={(e) => setCustomJamKerja(prev => ({ ...prev, [hari]: { ...prev[hari], pulang: e.target.value } }))}
                          className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                          placeholder="Jam Pulang"
                        />
                      </div>
                    ))}
                  </div>
                </div>"""

# Insert custom UI before submit button
target_insert = """              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >"""
              
if "Custom Jam Kerja Per Hari" not in content:
    content = content.replace(target_insert, custom_ui + "\n" + target_insert)

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
