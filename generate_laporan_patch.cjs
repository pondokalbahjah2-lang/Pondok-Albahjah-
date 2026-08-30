const fs = require('fs');
let code = fs.readFileSync('src/components/LaporanView.tsx', 'utf8');

// We need to add chart data for "Keseluruhan Pejuang" based on the selected date range.
// Let's compute this data in a useMemo.

const computedDataLogic = `
  const overallChartData = React.useMemo(() => {
    let hadir = 0, telat = 0, sakit = 0, cuti = 0, libur = 0, izin = 0;
    
    // Iterate through dates in the range
    const start = new Date(reportStartDate);
    const end = new Date(reportEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = getLocalDateString(d);
      
      accounts.filter(a => a.role === 'Pejuang').forEach(p => {
        const isCuti = leaveRequests.some(l => l.pejuangId === p.id && l.status === 'Disetujui' && l.tanggalMulai <= dateStr && l.tanggalSelesai >= dateStr);
        const isIzin = exitPermissions.some(e => e.pejuangId === p.id && e.status === 'Disetujui' && e.tanggalKeluar <= dateStr && e.tanggalIzinSampai >= dateStr);
        const att = attendance.find(a => a.pejuangId === p.id && a.date === dateStr);
        
        if (isCuti) cuti++;
        else if (att?.status === 'Sakit') sakit++;
        else if (att?.status === 'Libur') libur++;
        else if (isIzin) izin++;
        else if (att) {
          if (att.status === 'Hadir') hadir++;
          else if (att.status === 'Terlambat') telat++;
        }
      });
    }

    return [
      { name: 'Hadir', Total: hadir, fill: '#10b981' },
      { name: 'Telat', Total: telat, fill: '#f59e0b' },
      { name: 'Sakit', Total: sakit, fill: '#f43f5e' },
      { name: 'Cuti', Total: cuti, fill: '#6366f1' },
      { name: 'Izin', Total: izin, fill: '#0ea5e9' },
      { name: 'Libur', Total: libur, fill: '#a855f7' }
    ];
  }, [reportStartDate, reportEndDate, accounts, attendance, leaveRequests, exitPermissions]);
`;

code = code.replace(/(const filteredAccountsForReport = accounts.filter.*)/, computedDataLogic + '\n  $1');

const uiHtml = `
          {/* Grafik Keseluruhan Pejuang */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md mt-4 mb-8">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
              Tren Status Absensi Keseluruhan ({reportStartDate} s/d {reportEndDate})
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overallChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(203, 213, 225, 0.2)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Total" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {
                      overallChartData.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={entry.fill} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
`;

code = code.replace(/(<button\s+onClick=\{handleExportExcelAll\}[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/, '$1' + uiHtml);

fs.writeFileSync('src/components/LaporanView.tsx', code);
console.log("LaporanView updated successfully.");
