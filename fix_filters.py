import re

with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

if "const [amanahFilter, setAmanahFilter]" not in content:
    content = content.replace("const [divisiFilter, setDivisiFilter] = useState('Semua');", "const [divisiFilter, setDivisiFilter] = useState('Semua');\n  const [amanahFilter, setAmanahFilter] = useState('Semua');")
    
    # Extract unique amanah
    content = content.replace("const uniqueDivisions = Array.from(new Set(accounts.filter(a => a.subDivisi).map(a => a.subDivisi)));", "const uniqueDivisions = Array.from(new Set(accounts.filter(a => a.subDivisi).map(a => a.subDivisi)));\n  const uniqueAmanah = Array.from(new Set(accounts.filter(a => a.amanah).map(a => a.amanah)));")

    # Apply to filteredAccountsForReport
    content = content.replace("const filteredAccountsForReport = accounts.filter(a => divisiFilter === 'Semua' || a.subDivisi === divisiFilter);", "const filteredAccountsForReport = accounts.filter(a => (divisiFilter === 'Semua' || a.subDivisi === divisiFilter) && (amanahFilter === 'Semua' || a.amanah === amanahFilter));")
    
    # Add UI
    ui_insert = """            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Divisi Spesifik</label>
                <select value={divisiFilter} onChange={(e) => setDivisiFilter(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500">
                  <option value="Semua">Semua Divisi</option>
                  {uniqueDivisions.map(div => <option key={div} value={div}>{div}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori (Amanah)</label>
                <select value={amanahFilter} onChange={(e) => setAmanahFilter(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500">
                  <option value="Semua">Semua Kategori</option>
                  {uniqueAmanah.map(am => <option key={am} value={am}>{am}</option>)}
                </select>
              </div>
            </div>"""
    
    # Find the filter section
    content = re.sub(
        r'<select\s*value=\{divisiFilter\}\s*onChange=\{\(e\) => setDivisiFilter\(e\.target\.value\)\}\s*className="w-full p-2\.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500">\s*<option value="Semua">Semua Divisi</option>\s*\{uniqueDivisions\.map\(div => <option key=\{div\} value=\{div\}>\{div\}</option>\)\}\s*</select>',
        ui_insert,
        content
    )

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
