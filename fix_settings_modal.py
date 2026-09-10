import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

target_start = '              <div className="grid grid-cols-2 gap-3">\n                <div>\n                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jam Masuk (Subuh/Pagi)</label>'
target_end = '              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">'

start_idx = content.find(target_start)
end_idx = content.find(target_end, start_idx)

if start_idx != -1 and end_idx != -1:
    new_ui = """              {schTargetType === 'Group' && (
                <div className="col-span-2 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Pilih Anggota Pejuang</label>
                    <div className="max-h-32 overflow-y-auto space-y-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 custom-scrollbar">
                      {accounts.map(acc => (
                        <label key={acc.id} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-200 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={schPejuangIds.includes(acc.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSchPejuangIds([...schPejuangIds, acc.id]);
                              else setSchPejuangIds(schPejuangIds.filter(id => id !== acc.id));
                            }}
                            className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span>{acc.name} ({acc.subDivisi})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Pilih Divisi (Opsional)</label>
                    <div className="max-h-32 overflow-y-auto space-y-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 custom-scrollbar">
                      {uniqueDivisions.map(div => (
                        <label key={div} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-200 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={schDivisiIds?.includes(div) || false}
                            onChange={(e) => {
                              const curr = schDivisiIds || [];
                              if (e.target.checked) setSchDivisiIds([...curr, div]);
                              else setSchDivisiIds(curr.filter(d => d !== div));
                            }}
                            className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span>{div}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jam Masuk (Subuh/Pagi)</label>
                  <input
                    type="time"
                    required
                    value={schJamMasuk}
                    onChange={(e) => setSchJamMasuk(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jam Pulang / Selesai</label>
                  <input
                    type="time"
                    required
                    value={schJamPulang}
                    onChange={(e) => setSchJamPulang(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none font-bold"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Hari Kerja Aktif</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'].map((hari) => {
                    const isSelected = schHariKerja.includes(hari);
                    return (
                      <button
                        type="button"
                        key={hari}
                        onClick={() => toggleHariKerja(hari)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {hari}
                      </button>
                    );
                  })}
                </div>
              </div>
              
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

"""
    content = content[:start_idx] + new_ui + content[end_idx:]

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
