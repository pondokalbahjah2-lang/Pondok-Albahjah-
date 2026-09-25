const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const chartCode = `        {/* Kajian Weekly Trend Chart */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl lg:col-span-3 mt-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <LineChartIcon className="w-4 h-4 text-emerald-500" />
            Tren Partisipasi Kajian (Mingguan)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {(() => {
                // Group by week (last 4 weeks)
                const weeks = Array.from({length: 4}).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (i * 7));
                  return d;
                }).reverse();
                
                const myKajian = kajianRecords.filter(r => currentUser.role === 'Admin' || r.pejuangId === currentUser.id);
                
                const data = weeks.map((wDate, i) => {
                  const weekStart = new Date(wDate);
                  weekStart.setHours(0,0,0,0);
                  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekEnd.getDate() + 6);
                  
                  const recordsInWeek = myKajian.filter(r => {
                    const rDate = new Date(r.date);
                    return rDate >= weekStart && rDate <= weekEnd && r.statusValidasi !== 'Ditolak';
                  });
                  
                  const tafsir = recordsInWeek.filter(r => r.kajianName && r.kajianName.includes('Tafsir')).length;
                  const hadist = recordsInWeek.filter(r => r.kajianName && r.kajianName.includes('Mukhtasor')).length;
                  const hikam = recordsInWeek.filter(r => r.kajianName && r.kajianName.includes('Al-Hikam')).length;
                  
                  return {
                    name: \`Week \${4-i}\`,
                    Tafsir: tafsir,
                    Hadist: hadist,
                    AlHikam: hikam,
                    weekStartStr: getLocalDateString(weekStart).slice(5)
                  };
                });
                
                return (
                  <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                    <Line type="monotone" dataKey="Tafsir" stroke="#10b981" strokeWidth={3} dot={{r:4}} activeDot={{r:6}} />
                    <Line type="monotone" dataKey="Hadist" stroke="#3b82f6" strokeWidth={3} dot={{r:4}} activeDot={{r:6}} />
                    <Line type="monotone" dataKey="AlHikam" stroke="#f59e0b" strokeWidth={3} dot={{r:4}} activeDot={{r:6}} />
                  </RechartsLineChart>
                );
              })()}
            </ResponsiveContainer>
          </div>
        </div>`;

// Insert it before {/* 30 Days Chart */}
code = code.replace('{/* 30 Days Chart */}', chartCode + '\n        {/* 30 Days Chart */}');
fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('Inserted Recharts Kajian component into DashboardView.tsx');
