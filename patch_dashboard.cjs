const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// 1. Add 30-day percentage calculation
const dataCalcStr = `  // 30 Days Trend Percentage Calculation
  const monthlyKehadiranPercentage = React.useMemo(() => {
    const data = [];
    const today = new Date();
    const activePejuangs = accounts.filter(a => a.role === 'Pejuang').length;
    if (activePejuangs === 0) return []; // avoid division by zero

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      
      const dayRecords = attendance.filter(a => a.date === dateStr && (a.status === 'Hadir' || a.status === 'Terlambat'));
      // Using unique pejuang count who attended that day
      const uniqueAttendees = new Set(dayRecords.map(a => a.pejuangId)).size;
      const percentage = Math.round((uniqueAttendees / activePejuangs) * 100);
      
      data.push({
        name: dayName,
        persentase: percentage,
      });
    }
    return data;
  }, [attendance, accounts]);`;

content = content.replace("  // 6 Months Trend Real Data Calculation", dataCalcStr + "\n\n  // 6 Months Trend Real Data Calculation");

// 2. Add chart UI
const chartUI = `
        {/* Line Chart: 30 Days Attendance Percentage Trend */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <LineChartIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Tren Persentase Kehadiran (30 Hari Terakhir)</h3>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={monthlyKehadiranPercentage}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]} 
                  tickFormatter={(val) => \`\${val}%\`} 
                />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [\`\${value}%\`, 'Tingkat Kehadiran']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="persentase" name="Tingkat Kehadiran (%)" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
`;

// Insert the chart in the grid where the other charts are (after Bar Chart for Leave & Exit)
content = content.replace(
  "{/* Current User Weekly Attendance Consistency Trend */}",
  chartUI + "\n            {/* Current User Weekly Attendance Consistency Trend */}"
);

fs.writeFileSync('src/components/DashboardView.tsx', content);
