with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

# Add to grid - between Izin Keluar and Sakit
izin_keluar_block = """        {/* Total Izin Keluar */}
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Total Izin Keluar
            </span>
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalIzinKeluar}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Rekap Keluar Pondok
          </div>
        </div>"""

izin_tidak_masuk_block = """
        {/* Total Izin Tidak Masuk */}
        <div 
          onClick={() => setActiveListModal('izinTdkMasuk')}
          className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Izin Tdk Masuk
            </span>
            <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {todayStats.izin || 0}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Tidak Hadir (Izin)
          </div>
        </div>"""

content = content.replace(izin_keluar_block, izin_keluar_block + izin_tidak_masuk_block)

# Add to state and click handler
if "type ActiveModalType = 'belum' | 'terlambat'" in content:
    content = content.replace("type ActiveModalType = 'belum' | 'terlambat';", "type ActiveModalType = 'belum' | 'terlambat' | 'izinTdkMasuk';")

# Add modal content
modal_content_old = """          {activeListModal === 'terlambat' && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Daftar Terlambat Hadir ({pejuangTerlambat.length})
                </h3>
                <button onClick={() => setActiveListModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {pejuangTerlambat.length > 0 ? pejuangTerlambat.map((p, idx) => (
                  <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.subDivisi}</div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-500 text-sm italic">Tidak ada yang terlambat hari ini</div>
                )}
              </div>
            </div>
          )}"""

modal_content_new = modal_content_old + """
          {activeListModal === 'izinTdkMasuk' && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-500" />
                  Daftar Izin Tidak Masuk ({pejuangIzinTidakMasuk.length})
                </h3>
                <button onClick={() => setActiveListModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {pejuangIzinTidakMasuk.length > 0 ? pejuangIzinTidakMasuk.map((p, idx) => (
                  <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.subDivisi}</div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-500 text-sm italic">Tidak ada yang izin tidak masuk hari ini</div>
                )}
              </div>
            </div>
          )}"""

content = content.replace(modal_content_old, modal_content_new)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
