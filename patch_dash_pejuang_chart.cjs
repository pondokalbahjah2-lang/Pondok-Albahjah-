const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const anchor1 = `  const myLeaveStats = React.useMemo(() => {`;
const my14DaysChartDataCode = `  const my14DaysChartData = React.useMemo(() => {
    if (currentUser.role !== 'Pejuang') return [];
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      
      let dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      if (dayName === 'Min') dayName = 'Ahd';

      const rec = attendance.find(a => a.pejuangId === currentUser.id && a.date === dateStr);
      let statusVal = 0; // 0: None, 1: Hadir/Terlambat, 2: Izin, 3: Cuti
      if (rec) {
        if (rec.status === 'Hadir' || rec.status === 'Terlambat') statusVal = 1;
        else if (rec.status === 'Izin') statusVal = 2;
        else if (rec.status === 'Cuti') statusVal = 3;
      }
      
      data.push({
        name: \`\${dayName} \${d.getDate()}\`,
        date: dateStr,
        statusVal,
        statusLabel: rec ? rec.status : 'Belum/Libur',
      });
    }
    return data;
  }, [attendance, currentUser.id, currentUser.role]);

  const myLeaveStats = React.useMemo(() => {`;
code = code.replace(anchor1, my14DaysChartDataCode);

const anchor2 = `<div className="grid grid-cols-3 gap-4">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-3">`;

const chartUI = `          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <BarChartIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Konsistensi Kehadiran (14 Hari Terakhir)</h3>
            </div>
            <div className="flex-1 min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={my14DaysChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value, name, props) => [props.payload.statusLabel, 'Status']}
                  />
                  <Bar dataKey="statusVal" name="Kehadiran" radius={[4, 4, 0, 0]} barSize={20}>
                    {my14DaysChartData.map((entry, index) => {
                      let color = '#94a3b8'; // default grey
                      if (entry.statusVal === 1) color = '#10b981'; // green (Hadir)
                      else if (entry.statusVal === 2) color = '#f59e0b'; // orange (Izin)
                      else if (entry.statusVal === 3) color = '#a855f7'; // purple (Cuti)
                      return <Cell key={\`cell-\${index}\`} fill={color} />;
                    })}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-[10px] text-slate-500">Hadir</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="text-[10px] text-slate-500">Izin</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span><span className="text-[10px] text-slate-500">Cuti</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span><span className="text-[10px] text-slate-500">Libur/Kosong</span></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-3">`;

code = code.replace(anchor2, chartUI);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('DashboardView patched with pejuang chart.');
