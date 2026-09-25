import re

with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

# Add last30DaysData calculation
memo_pattern = r"(const last7DaysData = React\.useMemo\(\(\) => \{)"
last30_logic = """  const last30DaysData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(d);
      
      const record = attendance.find(a => a.pejuangId === currentUser.id && a.date === dateStr);
      let statusVal = 0;
      let fill = '#e2e8f0'; 
      if (record) {
        if (record.status === 'Hadir') { statusVal = 1; fill = '#10b981'; } 
        else if (record.status === 'Terlambat') { statusVal = 1; fill = '#f59e0b'; } 
        else if (record.status === 'Sakit') { statusVal = 1; fill = '#3b82f6'; } 
      }
      data.push({
        name: d.getDate(),
        date: dateStr,
        status: record ? record.status : 'Belum/Libur',
        value: statusVal,
        fill
      });
    }
    return data;
  }, [attendance, currentUser.id]);

"""
content = re.sub(memo_pattern, last30_logic + r"\1", content, count=1)

# Add UI for 30-day chart
chart_ui = """
        {/* 30 Days Chart */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChartIcon className="w-4 h-4 text-emerald-500" />
            Riwayat Absensi (30 Hari Terakhir)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={last30DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis hide />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-xl border border-slate-700">
                          <p className="font-bold mb-1">{data.date}</p>
                          <p>Status: <span style={{ color: data.fill }}>{data.status}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {last30DaysData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
"""

insert_pattern = r"(<div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">)"
content = re.sub(insert_pattern, r"\1\n" + chart_ui, content, count=1)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
