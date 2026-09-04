import re

with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

# 1. Add state for bulkSubDivisiFilter
state_pattern = r"(const \[bulkPeriode, setBulkPeriode\] = useState\('Agustus 2026'\);)"
state_replacement = r"\1\n  const [bulkSubDivisiFilter, setBulkSubDivisiFilter] = useState('Semua');"
content = re.sub(state_pattern, state_replacement, content)

# 2. Extract unique subdivisions
subdiv_pattern = r"(const pejuangAccounts = accounts\.filter\(\(a\) => a\.role === 'Pejuang'\);)"
subdiv_replacement = r"\1\n  const subDivisiList = React.useMemo(() => ['Semua', ...Array.from(new Set(pejuangAccounts.map(p => p.subDivisi)))], [pejuangAccounts]);"
content = re.sub(subdiv_pattern, subdiv_replacement, content)

# 3. Add the filter UI in the bulk upload section and filter the map
ui_pattern = r"(<h2 className=\"font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2\">\s*<Upload className=\"w-4 h-4 text-emerald-600\" />\s*<span>Upload Slip Ubar Massal</span>\s*</h2>)"

filter_ui = r"""\1
            <div className="mb-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Filter Divisi untuk Dropdown Pejuang
              </label>
              <select
                value={bulkSubDivisiFilter}
                onChange={(e) => setBulkSubDivisiFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
              >
                {subDivisiList.map(sd => (
                  <option key={sd} value={sd}>{sd}</option>
                ))}
              </select>
            </div>"""

content = re.sub(ui_pattern, filter_ui, content)

# 4. Filter pejuangAccounts mapping in bulkRows
map_pattern = r"(\{pejuangAccounts\.map\(\(p\) => \()"
map_replacement = r"{pejuangAccounts.filter(p => bulkSubDivisiFilter === 'Semua' || p.subDivisi === bulkSubDivisiFilter).map((p) => ("
content = re.sub(map_pattern, map_replacement, content)

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)
