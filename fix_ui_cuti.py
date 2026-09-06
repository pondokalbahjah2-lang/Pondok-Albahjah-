with open("src/components/CutiView.tsx", "r") as f:
    content = f.read()

target_ui = """                {jenisCuti === 'Cuti Tahunan' && currentUser.role !== 'Admin' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Durasi (1-4 Hari)
                    </label>
                    <select
                      value={durasiCutiTahunan}
                      onChange={(e) => setDurasiCutiTahunan(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value={1}>1 Hari</option>
                      <option value={2}>2 Hari</option>
                      <option value={3}>3 Hari</option>
                      <option value={4}>4 Hari</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tanggal Kembali Cuti
                    </label>
                    <input
                      type="date"
                      required
                      value={tanggalSelesai}
                      onChange={(e) => setTanggalSelesai(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                )}"""

replacement_ui = """                {jenisCuti === 'Cuti Tahunan' && currentUser.role !== 'Admin' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Durasi (1-4 Hari)
                    </label>
                    <select
                      value={durasiCutiTahunan}
                      onChange={(e) => setDurasiCutiTahunan(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value={1}>1 Hari</option>
                      <option value={2}>2 Hari</option>
                      <option value={3}>3 Hari</option>
                      <option value={4}>4 Hari</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Kembali Cuti
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    disabled={jenisCuti === 'Cuti Tahunan' && currentUser.role !== 'Admin'}
                    className={`w-full p-2.5 rounded-xl border border-slate-700 text-xs text-white ${
                      jenisCuti === 'Cuti Tahunan' && currentUser.role !== 'Admin' 
                        ? 'bg-slate-800/50 cursor-not-allowed opacity-70' 
                        : 'bg-slate-800'
                    }`}
                  />
                </div>"""

content = content.replace(target_ui, replacement_ui)

with open("src/components/CutiView.tsx", "w") as f:
    f.write(content)
