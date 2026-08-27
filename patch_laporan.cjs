const fs = require('fs');
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf8');

// 1. Add divisiFilter state
content = content.replace(
  "const [shiftFilter, setShiftFilter] = useState('');",
  "const [shiftFilter, setShiftFilter] = useState('');\n  const [divisiFilter, setDivisiFilter] = useState('Semua');"
);

// 2. Get unique divisions
content = content.replace(
  "const pejuangAccounts = accounts.filter((a) => {",
  "const uniqueDivisions = Array.from(new Set(accounts.filter(a => a.subDivisi).map(a => a.subDivisi)));\n  const filteredAccountsForReport = accounts.filter(a => divisiFilter === 'Semua' || a.subDivisi === divisiFilter);\n  const pejuangAccounts = accounts.filter((a) => {"
);

// 3. Apply divisiFilter to pejuangAccounts too
content = content.replace(
  "if (a.role !== 'Pejuang') return false;",
  "if (a.role !== 'Pejuang') return false;\n    if (divisiFilter !== 'Semua' && a.subDivisi !== divisiFilter) return false;"
);

// 4. In handleExportAllExcel and handleExportAllPDF, use filteredAccountsForReport instead of accounts
content = content.replace(
  "// Use accounts instead of pejuangAccounts to include Admin\n    accounts.forEach((p, idx) => {",
  "// Use filteredAccountsForReport to apply Divisi filter\n    filteredAccountsForReport.forEach((p, idx) => {"
);
content = content.replace(
  "accounts.forEach((p, idx) => {",
  "filteredAccountsForReport.forEach((p, idx) => {"
); // Ensure we catch the one in handleExportAllPDF too

// 5. Add UI for Divisi Filter
const shiftFilterUI = `              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Shift/Jadwal</option>
                {schedules?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.targetType === 'Divisi' ? \`Divisi: \${s.targetId}\` : \`Individu: \${s.targetId}\`}
                  </option>
                ))}
              </select>`;

const divisiFilterUI = `              <select
                value={divisiFilter}
                onChange={(e) => setDivisiFilter(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Semua">Semua Divisi</option>
                {uniqueDivisions.map((div, i) => (
                  <option key={i} value={div}>{div}</option>
                ))}
              </select>`;

content = content.replace(shiftFilterUI, divisiFilterUI + "\n" + shiftFilterUI);

// Fix the other accounts.forEach instances just in case
content = content.replace(
  "accounts.forEach((p, idx) => {",
  "filteredAccountsForReport.forEach((p, idx) => {"
);

fs.writeFileSync('src/components/LaporanView.tsx', content);
