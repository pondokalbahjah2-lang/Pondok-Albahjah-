with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

modal_ui = """
      {/* Active List Modal */}
      {activeListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>
                  {activeListModal === 'hadir' && 'Daftar Hadir Tepat Waktu'}
                  {activeListModal === 'terlambat' && 'Daftar Terlambat Hadir'}
                  {activeListModal === 'sakit' && 'Daftar Pejuang Sakit'}
                  {activeListModal === 'libur' && 'Daftar Pejuang Libur/Cuti'}
                  {activeListModal === 'belumAbsen' && 'Daftar Belum Absen'}
                </span>
              </h2>
              <button
                onClick={() => setActiveListModal(null)}
                className="p-2 -mr-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {todayStats.lists[activeListModal].length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400 italic border border-slate-100 dark:border-slate-800">
                  Tidak ada data untuk kategori ini.
                </div>
              ) : (
                todayStats.lists[activeListModal].map((item: any) => {
                  const name = item.pejuangName || item.name;
                  const subDivisi = item.subDivisi || (accounts.find(a => a.id === (item.pejuangId || item.id))?.subDivisi) || '-';
                  return (
                    <div key={item.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-100">{name}</div>
                        <div className="text-[10px] font-medium text-slate-500">{subDivisi}</div>
                      </div>
                      {item.waktuKedatangan && (
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {item.waktuKedatangan}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
"""

target = "{/* Dashboard Analytics for Pejuang */}"
content = content.replace(target, modal_ui + "\n    " + target)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
