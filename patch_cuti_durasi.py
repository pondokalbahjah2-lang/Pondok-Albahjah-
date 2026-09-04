import re

with open("src/components/CutiView.tsx", "r") as f:
    content = f.read()

# Remove the 4-day limit for Admin
limit_pattern = r"(if \(jenisCuti === 'Cuti Tahunan'\) \{)(\s+if \(totalHari > 4\) \{)"
limit_replacement = r"\1\n      if (totalHari > 4 && currentUser.role !== 'Admin') {"
content = re.sub(limit_pattern, limit_replacement, content)

# Change the UI for Admin so they can select any duration or just use the End Date
ui_pattern = r"(\{jenisCuti === 'Cuti Tahunan'\s*\?\s*\(\s*<div>\s*<label className=\"block text-xs font-semibold text-slate-300 mb-1\">\s*Durasi \(1-4 Hari\)\s*</label>\s*<select\s*value=\{durasiCutiTahunan\}\s*onChange=\{\(e\) => setDurasiCutiTahunan\(Number\(e\.target\.value\)\)\}[\s\S]*?</select>\s*</div>\s*\)\s*:\s*\()"
ui_replacement = r"{jenisCuti === 'Cuti Tahunan' && currentUser.role !== 'Admin' ? (\n                  <div>\n                    <label className=\"block text-xs font-semibold text-slate-300 mb-1\">\n                      Durasi (1-4 Hari)\n                    </label>\n                    <select\n                      value={durasiCutiTahunan}\n                      onChange={(e) => setDurasiCutiTahunan(Number(e.target.value))}\n                      className=\"w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white\"\n                    >\n                      <option value={1}>1 Hari</option>\n                      <option value={2}>2 Hari</option>\n                      <option value={3}>3 Hari</option>\n                      <option value={4}>4 Hari</option>\n                    </select>\n                  </div>\n                ) : ("
content = re.sub(ui_pattern, ui_replacement, content)

with open("src/components/CutiView.tsx", "w") as f:
    f.write(content)
