const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const summaryState = `
  // Today's Attendance Statistics
  const todayStats = React.useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    const pejuangs = accounts.filter(a => a.role === 'Pejuang');
    const totalPejuang = pejuangs.length;
    
    const todayAttendance = attendance.filter(a => a.date === todayStr);
    const hadir = todayAttendance.filter(a => a.status === 'Hadir').length;
    const terlambat = todayAttendance.filter(a => a.status === 'Terlambat').length;
    // To find out who hasn't clocked in, we check who isn't in todayAttendance
    const attendeesIds = new Set(todayAttendance.map(a => a.pejuangId));
    const belumAbsen = pejuangs.filter(p => !attendeesIds.has(p.id)).length;
    
    return { total: totalPejuang, hadir, terlambat, belumAbsen };
  }, [accounts, attendance]);
`;

content = content.replace(
  '  // 30 Days Trend Percentage Calculation',
  summaryState + '\n  // 30 Days Trend Percentage Calculation'
);

const summaryUI = `
      {/* Today's Attendance Summary Cards */}
      {currentUser.role === 'Admin' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Total Pejuang</div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{todayStats.total}</div>
            </div>
          </div>
          
          <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Hadir Tepat Waktu</div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{todayStats.hadir}</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400">Terlambat</div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{todayStats.terlambat}</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400">Belum Absen</div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{todayStats.belumAbsen}</div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  '{/* Filter Section for Admin */}',
  summaryUI + '\n      {/* Filter Section for Admin */}'
);

fs.writeFileSync('src/components/DashboardView.tsx', content);
