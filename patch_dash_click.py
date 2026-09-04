with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

target1 = """        {/* Absen Tepat Waktu */}
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">"""
replacement1 = """        {/* Absen Tepat Waktu */}
        <div 
          onClick={() => setActiveListModal('hadir')}
          className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-transform"
        >"""

target2 = """        {/* Terlambat Hadir */}
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">"""
replacement2 = """        {/* Terlambat Hadir */}
        <div 
          onClick={() => setActiveListModal('terlambat')}
          className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-transform"
        >"""

target3 = """            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Belum Absen ({todayStats.belumAbsen})</span>
            </div>"""
replacement3 = """            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => setActiveListModal('belumAbsen')}>
              <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline">Belum Absen ({todayStats.belumAbsen})</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 mt-1" onClick={() => setActiveListModal('sakit')}>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline">Sakit ({todayStats.sakit})</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 mt-1" onClick={() => setActiveListModal('libur')}>
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline">Libur/Cuti ({todayStats.libur})</span>
            </div>"""

content = content.replace(target1, replacement1).replace(target2, replacement2).replace(target3, replacement3)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
