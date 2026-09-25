const fs = require('fs');
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf8');

const shiftFilterSelect = `              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Shift/Jadwal</option>
                {(schedules || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.targetName} ({s.jamMasuk} - {s.jamPulang})
                  </option>
                ))}
              </select>`;

const newDivisiSelect = `              <select
                value={divisiFilter}
                onChange={(e) => setDivisiFilter(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Semua">Semua Divisi</option>
                {uniqueDivisions.map((div, i) => (
                  <option key={i} value={div}>{div}</option>
                ))}
              </select>`;

content = content.replace(shiftFilterSelect, newDivisiSelect + "\\n" + shiftFilterSelect);

fs.writeFileSync('src/components/LaporanView.tsx', content);
