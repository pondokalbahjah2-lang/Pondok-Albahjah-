const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const uiInsertionStr = `
      {/* ---------------- Admin Summary Visualizations ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
        {/* Daily Attendance Trends */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-indigo-500" />
              Tren Kehadiran Harian (7 Hari Terakhir)
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={adminDailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="hadir" name="Hadir Tepat Waktu" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="terlambat" name="Terlambat" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="tidakHadir" name="Tidak Hadir (Sakit/Libur)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Top Absenteeism Departments */}
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex-1">
            <h3 className="text-md font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-rose-500" />
              Divisi Paling Sering Absen
            </h3>
            <div className="h-40">
              {adminAbsenteeismDept.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={adminAbsenteeismDept} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="divisi" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="absen" name="Jumlah Absen" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={16} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                  Belum ada data absensi
                </div>
              )}
            </div>
          </div>

          {/* Pending Requests Metrics */}
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex-1">
            <h3 className="text-md font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-amber-500" />
              Permintaan Tertunda
            </h3>
            <div className="flex items-center justify-between h-full">
              <div className="h-32 w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={pendingRequestsCount} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                      {pendingRequestsCount.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col justify-center gap-3">
                {pendingRequestsCount.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }}></div>
                      {item.name}
                    </span>
                    <span className="text-xl font-bold text-slate-800 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ------------------------------------------------------------ */}
`;

const markerStr = '        {/* Sedang Cuti */}\n        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">';

const contentParts = content.split(markerStr);
if (contentParts.length === 2) {
  // We need to jump over the Sedang Cuti card.
  // Look for the end of it which is `</div>\n      </div>`
  const restStr = contentParts[1];
  const endMarker = '</div>\n      </div>';
  const restParts = restStr.split(endMarker);
  
  if (restParts.length >= 2) {
    const finalContent = contentParts[0] + markerStr + restParts[0] + '</div>\n      </div>\n' + uiInsertionStr + '\n' + restParts.slice(1).join(endMarker);
    fs.writeFileSync('src/components/DashboardView.tsx', finalContent);
    console.log('Successfully injected UI');
  } else {
     console.log('Failed to find endmarker');
  }
} else {
  console.log('Failed to find markerStr');
}
