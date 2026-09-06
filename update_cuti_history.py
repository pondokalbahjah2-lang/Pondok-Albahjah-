with open("src/components/CutiView.tsx", "r") as f:
    content = f.read()

history_table = """
        <div className="bg-white/70 dark:bg-slate-900/60 rounded-3xl border border-white/60 dark:border-white/10 shadow-xl overflow-hidden p-6 mb-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Tabel Riwayat Pemakaian Cuti Keseluruhan
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Pejuang</th>
                  <th className="py-3 px-3">Jenis Cuti</th>
                  <th className="py-3 px-3">Tanggal Pelaksanaan</th>
                  <th className="py-3 px-3">Durasi</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaveRequests.filter(l => l.status === 'Disetujui' || l.status === 'Selesai' || l.status === 'Sedang Cuti').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">Belum ada riwayat cuti yang disetujui.</td>
                  </tr>
                ) : (
                  leaveRequests
                    .filter(l => l.status === 'Disetujui' || l.status === 'Selesai' || l.status === 'Sedang Cuti')
                    .sort((a, b) => new Date(b.tanggalMulai).getTime() - new Date(a.tanggalMulai).getTime())
                    .map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800 dark:text-slate-100">{req.pejuangName}</div>
                          <div className="text-[10px] text-slate-500">{req.subDivisi}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">{req.jenisCuti}</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{req.tanggalMulai} s/d {req.tanggalSelesai}</td>
                        <td className="py-3 px-3 font-bold text-amber-600 dark:text-amber-500">{req.totalHari} Hari</td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
"""

idx = content.find("      {statusFilter === 'Rekap Kuota Cuti' ? (")
if idx != -1:
    target = "          </div>\n        </div>\n      ) : ("
    target_idx = content.find(target, idx)
    if target_idx != -1:
        content = content[:target_idx] + "          </div>\n        </div>\n" + history_table + "      ) : (" + content[target_idx + len(target):]

with open("src/components/CutiView.tsx", "w") as f:
    f.write(content)
