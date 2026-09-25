import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

holiday_ui = """
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>Pengaturan Hari Libur (Tanggal Merah)</span>
              </h2>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Tambah Hari Libur Baru</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  const newHoliday = {
                    id: `holiday-${Date.now()}`,
                    tanggal: target.tanggal.value,
                    keterangan: target.keterangan.value
                  };
                  // In a real app this would call an API, for now we can just use the prop if it had a setter
                  // Since we didn't pass a setter, let's just trigger a custom event or let's import setDoc
                  // Actually since this is SettingsView, we can use Firestore directly
                  import('firebase/firestore').then(({ doc, setDoc }) => {
                    import('../utils/firebase').then(({ db }) => {
                      setDoc(doc(db, 'holidays', newHoliday.id), newHoliday).then(() => {
                        target.reset();
                        alert('Hari libur ditambahkan');
                      });
                    });
                  });
                }} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Tanggal</label>
                    <input type="date" name="tanggal" required className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Keterangan / Nama Libur</label>
                    <input type="text" name="keterangan" required placeholder="Contoh: Idul Fitri" className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white" />
                  </div>
                  <button type="submit" className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all">Simpan Hari Libur</button>
                </form>
              </div>
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 max-h-64 overflow-y-auto custom-scrollbar">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Daftar Hari Libur</h3>
                <div className="space-y-2">
                  {holidays && holidays.length > 0 ? holidays.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map(h => (
                    <div key={h.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-xs font-bold text-rose-600 dark:text-rose-400">{h.tanggal}</div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-300">{h.keterangan}</div>
                      </div>
                      <button onClick={() => {
                        if (window.confirm('Hapus hari libur ini?')) {
                          import('firebase/firestore').then(({ doc, deleteDoc }) => {
                            import('../utils/firebase').then(({ db }) => {
                              deleteDoc(doc(db, 'holidays', h.id));
                            });
                          });
                        }
                      }} className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )) : (
                    <div className="text-xs text-slate-500 italic text-center py-4">Belum ada data hari libur</div>
                  )}
                </div>
              </div>
            </div>
          </div>
"""

content = content.replace("      {/* Tab Content 3: Data Pejuang */}", holiday_ui + "\n      {/* Tab Content 3: Data Pejuang */}")

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
