with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

usage_table_code = """
        {/* Leave Usage Table */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-500" />
            Tabel Pemakaian Cuti
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3 rounded-l-xl font-semibold">Jenis Cuti</th>
                  <th className="p-3 font-semibold">Tanggal Mulai</th>
                  <th className="p-3 font-semibold">Tanggal Selesai</th>
                  <th className="p-3 font-semibold">Total Hari</th>
                  <th className="p-3 rounded-r-xl font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaveRequests
                  .filter(l => l.pejuangId === currentUser.id && (l.status === 'Disetujui' || l.status === 'Selesai' || l.status === 'Sedang Cuti'))
                  .sort((a, b) => new Date(b.tanggalMulai).getTime() - new Date(a.tanggalMulai).getTime())
                  .length > 0 ? (
                  leaveRequests
                    .filter(l => l.pejuangId === currentUser.id && (l.status === 'Disetujui' || l.status === 'Selesai' || l.status === 'Sedang Cuti'))
                    .sort((a, b) => new Date(b.tanggalMulai).getTime() - new Date(a.tanggalMulai).getTime())
                    .map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300">
                        <td className="p-3 font-medium">{l.jenisCuti}</td>
                        <td className="p-3">{l.tanggalMulai}</td>
                        <td className="p-3">{l.tanggalSelesai}</td>
                        <td className="p-3 font-bold">{l.totalHari} Hari</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg font-bold text-[10px]">
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500 font-medium">Belum ada riwayat pemakaian cuti.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
"""

idx = content.rfind("      </div>\n    </div>\n  );\n};")
if idx != -1:
    content = content[:idx] + usage_table_code + content[idx:]
    with open("src/components/DashboardView.tsx", "w") as f:
        f.write(content)
