const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// 1. Add myTodayRecord memo
const myWeeklyStatsAnchor = `  const myWeeklyStats = React.useMemo(() => {`;
const myTodayRecordLogic = `  // Today's specific attendance for current user
  const myTodayRecord = React.useMemo(() => {
    if (currentUser.role !== 'Pejuang') return null;
    const todayStr = getLocalDateString(new Date());
    return attendance.find(a => a.pejuangId === currentUser.id && a.date === todayStr) || null;
  }, [attendance, currentUser.id, currentUser.role]);

  const myWeeklyStats = React.useMemo(() => {`;
code = code.replace(myWeeklyStatsAnchor, myTodayRecordLogic);


// 2. Add UI for today's clock in/out
const uiAnchor = `      {/* Weekly Stats for Pejuang */}
      {currentUser.role === 'Pejuang' && (
        <div className="grid grid-cols-3 gap-4">`;
        
const uiReplace = `      {/* Weekly Stats for Pejuang */}
      {currentUser.role === 'Pejuang' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Jam Masuk (Hari Ini)</p>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">
                    {myTodayRecord ? myTodayRecord.time : '--:--'} WIB
                  </h4>
                </div>
              </div>
              <span className={\`text-xs font-bold px-2 py-1 rounded-full \${myTodayRecord ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}\`}>
                {myTodayRecord ? (myTodayRecord.status === 'Terlambat' ? 'Terlambat' : 'Sudah Absen') : 'Belum Absen'}
              </span>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Jam Pulang (Hari Ini)</p>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">
                    {myTodayRecord && myTodayRecord.timePulang ? myTodayRecord.timePulang : '--:--'} WIB
                  </h4>
                </div>
              </div>
              <span className={\`text-xs font-bold px-2 py-1 rounded-full \${myTodayRecord && myTodayRecord.timePulang ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}\`}>
                {myTodayRecord && myTodayRecord.timePulang ? 'Selesai' : 'Belum Pulang'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">`;

code = code.replace(uiAnchor, uiReplace);

// 3. Close the new div space-y-4 wrapper
const uiEndAnchor = `        </div>
      )}

      {/* Welcome & Pasal Header */}`;
      
const uiEndReplace = `        </div>
        </div>
      )}

      {/* Welcome & Pasal Header */}`;

code = code.replace(uiEndAnchor, uiEndReplace);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('Patch complete.');
