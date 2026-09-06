with open("src/components/CutiView.tsx", "r") as f:
    content = f.read()

content = content.replace("{statusFilter === 'Rekap Kuota Cuti' ? (\n        <div className=\"bg-white/70 dark:bg-slate-900/60 rounded-3xl border border-white/60 dark:border-white/10 shadow-xl overflow-hidden p-6 mb-6\">", "{statusFilter === 'Rekap Kuota Cuti' ? (\n        <>\n        <div className=\"bg-white/70 dark:bg-slate-900/60 rounded-3xl border border-white/60 dark:border-white/10 shadow-xl overflow-hidden p-6 mb-6\">")

content = content.replace("          </div>\n        </div>\n      ) : (", "          </div>\n        </div>\n        </>\n      ) : (")

with open("src/components/CutiView.tsx", "w") as f:
    f.write(content)
