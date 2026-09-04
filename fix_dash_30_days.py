import re

with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

# 1. Remove the 30-day chart from Admin Dashboard (lines ~948-980)
chart_pattern = r"(        \{/\* 30 Days Chart \*/\}[\s\S]*?</div>\s*</div>)"

# Make sure we only remove the FIRST match (the wrong one)
# We'll use re.split or replace the first instance
if "{/* 30 Days Chart */}" in content:
    parts = re.split(chart_pattern, content, maxsplit=1)
    if len(parts) == 3:
        # parts[1] is the matched chart
        content = parts[0] + parts[2]

# 2. Add the 30-day chart to PejuangDashboardAnalytics
# Let's insert it right after the `last7DaysData` chart in PejuangDashboardAnalytics
target = r"(<h3 className=\"text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2\">\s*<BarChartIcon className=\"w-4 h-4 text-emerald-500\" />\s*Riwayat Absensi \(7 Hari Terakhir\)\s*</h3>[\s\S]*?</div>\s*</div>)"

chart_ui = """
        {/* 30 Days Chart */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl lg:col-span-2 mt-6">
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

content = re.sub(target, r"\1\n" + chart_ui, content)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
