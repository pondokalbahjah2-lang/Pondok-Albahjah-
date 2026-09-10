import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

ui_addition = """              </div>

              <div>
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Tanggal Libur Khusus / Nasional</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      id="newHolidayDate"
                      className="flex-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const dateInput = document.getElementById('newHolidayDate') as HTMLInputElement;
                        if (dateInput.value && !schTanggalLibur.includes(dateInput.value)) {
                          setSchTanggalLibur([...schTanggalLibur, dateInput.value]);
                          dateInput.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-bold transition-colors"
                    >
                      + Tambah Libur
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {schTanggalLibur.map(tgl => (
                      <div key={tgl} className="flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-1 rounded-md text-xs font-bold border border-rose-200">
                        <span>{tgl}</span>
                        <button type="button" onClick={() => setSchTanggalLibur(schTanggalLibur.filter(t => t !== tgl))} className="text-rose-500 hover:text-rose-800 ml-1">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">"""

content = content.replace("              </div>\n              <div className=\"flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800\">", ui_addition)

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
