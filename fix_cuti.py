import re

with open("src/components/CutiView.tsx", "r") as f:
    content = f.read()

# Remove the stray )}
content = re.sub(r"</div>\s*\)\}\s*\{\/\* Modal Add Leave Request \*/\}", r"</div>\n\n      {/* Modal Add Leave Request */}", content)

# Now inject the ternary correctly.
# The table starts at <div className="p-5 rounded-3xl ... overflow-x-auto">
target = r"(<div className=\"p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl overflow-x-auto\">\s*<table className=\"w-full text-left border-collapse text-xs\">)"

rekap_ui = """
      {statusFilter === 'Rekap Kuota Cuti' ? (
        <div className="bg-white/70 dark:bg-slate-900/60 rounded-3xl border border-white/60 dark:border-white/10 shadow-xl overflow-hidden p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Rekap & Input Manual Cuti Tahunan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Nama Pejuang</th>
                  <th className="py-3 px-3">Sub Divisi</th>
                  <th className="py-3 px-3">Kuota Terpakai</th>
                  <th className="py-3 px-3">Sisa Kuota</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {accounts.filter(a => a.role === 'Pejuang').map(p => {
                  const sisa = getSisaCutiTahunan(p.id);
                  const maxCuti = 12;
                  const terpakai = maxCuti - sisa;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-xs text-slate-800 dark:text-slate-200">{p.name}</td>
                      <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400">{p.subDivisi}</td>
                      <td className="py-3 px-3 text-xs text-amber-600 font-bold">{terpakai} Hari</td>
                      <td className="py-3 px-3 text-xs text-emerald-600 font-bold">{sisa} Hari</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setTargetPejuangId(p.id);
                            setJenisCuti('Cuti Tahunan');
                            setShowAddModal(true);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold text-[10px] transition-colors"
                        >
                          Input Manual Cuti
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
"""

content = re.sub(target, rekap_ui + r"\1", content)

# Close the ternary after the table wrapper
closing_target = r"(</table>\s*</div>\s*)\{\/\* Modal Add Leave Request \*\/\}";
content = re.sub(closing_target, r"\1)}\n\n      {/* Modal Add Leave Request */}", content)

with open("src/components/CutiView.tsx", "w") as f:
    f.write(content)
