const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// We want to add calculation logic near line 241, after `dailyStats`.

const newLogic = `
  // --- New Logic: Hari Ini & Efektif Bulanan ---
  const todayDateStr = getLocalDateString(new Date());
  
  // List Pejuang Terlambat Hari Ini
  const pejuangTerlambatHadir = React.useMemo(() => {
    return attendance.filter(a => a.date === todayDateStr && a.status === 'Terlambat');
  }, [attendance, todayDateStr]);

  // List Pejuang Sedang Cuti Hari Ini
  const pejuangCutiHariIni = React.useMemo(() => {
    return leaveRequests.filter(l => l.status === 'Disetujui' && l.tanggalMulai <= todayDateStr && l.tanggalSelesai >= todayDateStr);
  }, [leaveRequests, todayDateStr]);

  // List Pejuang Sedang Izin Keluar Hari Ini
  const pejuangIzinHariIni = React.useMemo(() => {
    return exitPermissions.filter(e => e.tanggalKeluar <= todayDateStr && e.tanggalIzinSampai >= todayDateStr && e.status === 'Disetujui');
  }, [exitPermissions, todayDateStr]);

  // Total Jam Kerja Efektif Bulanan (Bulan Ini)
  const efektifBulanan = React.useMemo(() => {
    const currentMonthPrefix = todayDateStr.substring(0, 7); // YYYY-MM
    const attBulanIni = attendance.filter(a => a.date.startsWith(currentMonthPrefix));
    
    const jamKerja: Record<string, number> = {}; // pejuangId -> total minutes
    
    attBulanIni.forEach(att => {
      if (!att.time || !att.timePulang) return;
      if (['Sakit', 'Libur', 'Cuti', 'Tidak Absen Pulang', '-'].includes(att.timePulang)) return;
      if (['Sakit', 'Libur', 'Cuti', '-'].includes(att.time)) return;

      const [hIn, mIn] = att.time.split(':').map(Number);
      const [hOut, mOut] = att.timePulang.split(':').map(Number);
      
      if (!isNaN(hIn) && !isNaN(mIn) && !isNaN(hOut) && !isNaN(mOut)) {
        let diff = (hOut * 60 + mOut) - (hIn * 60 + mIn);
        if (diff > 0) {
          jamKerja[att.pejuangId] = (jamKerja[att.pejuangId] || 0) + diff;
        }
      }
    });
    
    // Sort pejuang by highest effective hours
    const sortedPejuang = Object.entries(jamKerja).map(([id, mins]) => {
      const p = accounts.find(a => a.id === id);
      return {
        id,
        name: p ? p.name : 'Unknown',
        subDivisi: p ? p.subDivisi : '-',
        totalHours: (mins / 60).toFixed(1),
        totalMins: mins
      };
    }).sort((a, b) => b.totalMins - a.totalMins);

    return sortedPejuang;
  }, [attendance, todayDateStr, accounts]);
`;

code = code.replace(/(\/\/\s*30 Days Trend Percentage Calculation)/, newLogic + '\n  $1');

// Now, we need to inject the UI. We can place it under the "PrayerTimesWidget" row, or before the Charts.
const uiHtml = `
      {/* -------------------- Kinerja Bulanan & Hari Ini -------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Jam Kerja Efektif Bulanan */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
            <Clock className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">Jam Kerja Efektif (Bulan Ini)</h3>
          </div>
          {currentUser.role === 'Admin' ? (
             efektifBulanan.length > 0 ? (
               <div className="space-y-3">
                 {efektifBulanan.slice(0, 5).map((p, idx) => (
                   <div key={p.id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="font-black text-slate-300 dark:text-slate-600 w-4 text-center">{idx + 1}</div>
                        <div>
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{p.name}</div>
                          <div className="text-[10px] text-slate-500">{p.subDivisi}</div>
                        </div>
                      </div>
                      <div className="font-extrabold text-emerald-600 dark:text-emerald-400">{p.totalHours} <span className="text-[10px] font-normal text-slate-500">Jam</span></div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center p-4 text-slate-400 text-xs italic">Belum ada data absensi lengkap bulan ini.</div>
             )
          ) : (
             <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                  {efektifBulanan.find(p => p.id === currentUser.id)?.totalHours || '0.0'}
                </div>
                <div className="text-xs font-bold text-slate-500">Total Jam Kerja Bulan Ini</div>
             </div>
          )}
        </div>

        {/* Kolom Kanan: Status Pejuang Hari Ini */}
        {currentUser.role === 'Admin' && (
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Terlambat */}
            <div className="p-5 rounded-3xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 flex flex-col">
              <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 mb-4">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-orange-800 dark:text-orange-300">Terlambat Hadir (Hari Ini)</h3>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[200px] pr-1">
                {pejuangTerlambatHadir.length > 0 ? (
                  pejuangTerlambatHadir.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-orange-100 dark:border-orange-800/30">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-2">{p.pejuangName}</div>
                      <div className="text-[10px] font-bold text-orange-600">{p.time}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-2 text-orange-400/70 text-[10px] italic">Tidak ada yang terlambat.</div>
                )}
              </div>
            </div>

            {/* Cuti */}
            <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 flex flex-col">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-4">
                <Palmtree className="w-5 h-5" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-800 dark:text-indigo-300">Sedang Cuti (Hari Ini)</h3>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[200px] pr-1">
                {pejuangCutiHariIni.length > 0 ? (
                  pejuangCutiHariIni.map(p => {
                    const user = accounts.find(a => a.id === p.pejuangId);
                    return (
                      <div key={p.id} className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-indigo-100 dark:border-indigo-800/30">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{p.pejuangName || user?.name}</div>
                        <div className="text-[9px] text-indigo-600 mt-0.5 truncate">{p.alasan}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-2 text-indigo-400/70 text-[10px] italic">Tidak ada yang cuti.</div>
                )}
              </div>
            </div>

            {/* Izin Keluar */}
            <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex flex-col">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-4">
                <MapPin className="w-5 h-5" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-800 dark:text-blue-300">Sedang Izin (Hari Ini)</h3>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[200px] pr-1">
                {pejuangIzinHariIni.length > 0 ? (
                  pejuangIzinHariIni.map(p => {
                    const user = accounts.find(a => a.id === p.pejuangId);
                    return (
                      <div key={p.id} className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-blue-100 dark:border-blue-800/30">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{p.pejuangName || user?.name}</div>
                        <div className="text-[9px] text-blue-600 mt-0.5 truncate">{p.tujuan}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-2 text-blue-400/70 text-[10px] italic">Tidak ada yang izin keluar.</div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
`;

code = code.replace(/(\{ \/\* Quick Actions \(Pejuang\) \*\/\})/, uiHtml + '\n      $1');

fs.writeFileSync('src/components/DashboardView.tsx', code);
