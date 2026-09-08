import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

if "const [schPejuangIds, setSchPejuangIds]" not in content:
    content = content.replace(
        "const [schHariKerja, setSchHariKerja] = useState<string[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);",
        "const [schHariKerja, setSchHariKerja] = useState<string[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);\n  const [schPejuangIds, setSchPejuangIds] = useState<string[]>([]);"
    )

content = content.replace("setSchTargetType(sch.targetType);", "setSchTargetType(sch.targetType);\n    setSchPejuangIds(sch.pejuangIds || []);")

handle_add_new = """
    const newSchedule: WorkSchedule = {
      id: editScheduleId || `sch-${Date.now()}`,
      targetType: schTargetType,
      targetId: schTargetType === 'Individu' ? (targetPejuang?.id || finalTargetName) : schTargetType === 'Group' ? 'Group' : finalTargetName,
      targetName: finalTargetName,
      jamMasuk: schJamMasuk,
      jamPulang: schJamPulang,
      hariKerja: schHariKerja,
      customJamKerja,
      pejuangIds: schTargetType === 'Group' ? schPejuangIds : undefined
    };
"""
content = re.sub(
    r"const newSchedule: WorkSchedule = \{\s*id: editScheduleId \|\| `sch-\$\{Date\.now\(\)\}`,\s*targetType: schTargetType,\s*targetId: [^,]+,\s*targetName: finalTargetName,\s*jamMasuk: schJamMasuk,\s*jamPulang: schJamPulang,\s*hariKerja: schHariKerja,\s*customJamKerja\s*\};",
    handle_add_new,
    content
)

ui_replacement = """                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {schTargetType === 'Divisi' ? 'Pilih / Nama Divisi' : schTargetType === 'Group' ? 'Nama Group' : 'Pilih Nama Pejuang'}
                  </label>
                  {schTargetType === 'Divisi' || schTargetType === 'Group' ? (
                    <input
                      type="text"
                      required
                      value={schTargetName}
                      onChange={(e) => setSchTargetName(e.target.value)}
                      placeholder={schTargetType === 'Group' ? 'Contoh: Tim Proyek A' : 'Contoh: Media / Keuangan / Dapur'}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  ) : ("""
                  
content = re.sub(
    r'<label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">\s*\{schTargetType === \'Divisi\' \? \'Pilih / Nama Divisi\' : \'Pilih Nama Pejuang\'\}\s*</label>\s*\{schTargetType === \'Divisi\' \? \(\s*<input\s*type="text"\s*required\s*value=\{schTargetName\}\s*onChange=\{\(e\) => setSchTargetName\(e\.target\.value\)\}\s*placeholder="Contoh: Media / Keuangan / Dapur"\s*className="w-full p-2\.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"\s*/>\s*\) : \(',
    ui_replacement,
    content
)

group_pejuang_ui = """              {schTargetType === 'Group' && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Pilih Anggota Pejuang</label>
                  <div className="max-h-32 overflow-y-auto space-y-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 custom-scrollbar">
                    {accounts.map(acc => (
                      <label key={acc.id} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-200 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={schPejuangIds.includes(acc.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSchPejuangIds([...schPejuangIds, acc.id]);
                            else setSchPejuangIds(schPejuangIds.filter(id => id !== acc.id));
                          }}
                          className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>{acc.name} ({acc.subDivisi})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">"""

content = content.replace("              <div className=\"grid grid-cols-2 gap-3\">\n                <div>\n                  <label className=\"block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1\">Jam Masuk</label>", group_pejuang_ui + "\n                <div>\n                  <label className=\"block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1\">Jam Masuk</label>")

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
