const fs = require('fs');
let code = fs.readFileSync('src/components/LaporanView.tsx', 'utf8');

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

// Looking for </button>\s*</div>\s*</div>\s*</>\s*)} near the handleExportAllExcel
const match = code.match(/(<button\s+onClick=\{handleExportAllExcel\}[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/>\s*\)}?)/);
if (match) {
  code = code.replace(match[0], match[0] + '\\n' + uiHtml);
  fs.writeFileSync('src/components/LaporanView.tsx', code);
  console.log('LaporanView UI patched successfully.');
} else {
  console.log('Could not find injection point for UI.');
  // Let's do a fallback replace
  const fallbackMatch = code.match(/(\{\/\* Select Pejuang Target \(for Admin\) \*\/\})/);
  if (fallbackMatch) {
     code = code.replace(fallbackMatch[0], uiHtml + '\\n\\n' + fallbackMatch[0]);
     fs.writeFileSync('src/components/LaporanView.tsx', code);
     console.log('LaporanView UI patched via fallback.');
  }
}
