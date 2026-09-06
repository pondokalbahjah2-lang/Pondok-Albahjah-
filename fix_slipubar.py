import re

with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

# I will append the missing handleRevealPassword and the return block.
missing_code = """
  const handleRevealPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const slip = slipUbarList.find(s => s.id === revealSlipId);
    if (!slip) return;
    
    if (currentUser.role === 'Admin' || revealPasswordInput === currentUser.password) {
      setRevealedPassword(slip.filePassword || 'Tidak ada sandi');
      setRevealError('');
    } else {
      setRevealError('Kata sandi akun salah.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            Distribusi Slip Ubar (Uang Barokah)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser.role === 'Admin' 
              ? 'Kelola dan distribusikan dokumen slip ubar (PDF/Image) kepada pejuang dengan aman.'
              : 'Akses dan unduh dokumen slip ubar (Uang Barokah) Anda secara aman.'}
          </p>
        </div>
      </div>

      {currentUser.role === 'Admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Single */}
          <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-500" />
              Upload Individual (Link GDrive)
            </h2>
            <form onSubmit={handleUploadSlip} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Pilih Pejuang
                </label>
                <select
                  required
                  value={selectedPejuangId}
                  onChange={(e) => setSelectedPejuangId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Pilih Pejuang --</option>
                  {pejuangAccounts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.subDivisi})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Periode</label>
                  <input
                    type="text"
                    required
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Password (Opsional)</label>
                  <input
                    type="text"
                    value={singleFilePassword}
                    onChange={(e) => setSingleFilePassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Link GDrive</label>
                <input
                  type="url"
                  required
                  value={gdriveLink}
                  onChange={(e) => setGdriveLink(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all">Upload Single Slip</button>
            </form>
          </div>

          {/* Bulk Upload */}
          <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-500" />
              Upload Massal per Divisi
            </h2>
            <form onSubmit={handleBulkUploadSlip} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Filter Sub Divisi</label>
                <select
                  value={bulkSubDivisiFilter}
                  onChange={(e) => setBulkSubDivisiFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                >
                  {subDivisiList.map(sd => (
                    <option key={sd} value={sd}>{sd}</option>
                  ))}
                </select>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-white dark:bg-slate-900">
                {pejuangAccounts.filter(p => bulkSubDivisiFilter === 'Semua' || p.subDivisi === bulkSubDivisiFilter).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="w-1/3 truncate font-bold text-xs text-slate-700 dark:text-slate-200" title={p.name}>
                      {p.name}
                    </div>
                    <input
                      type="url"
                      placeholder="Link GDrive..."
                      value={bulkData[p.id]?.gdriveLink || ''}
                      onChange={(e) => {
                        setBulkData(prev => ({
                          ...prev,
                          [p.id]: { ...(prev[p.id] || {}), gdriveLink: e.target.value }
                        }));
                      }}
                      className="w-1/3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="Password..."
                      value={bulkData[p.id]?.password || ''}
                      onChange={(e) => {
                        setBulkData(prev => ({
                          ...prev,
                          [p.id]: { ...(prev[p.id] || {}), password: e.target.value }
                        }));
                      }}
                      className="w-1/3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Periode (Untuk Semua)</label>
                <input
                  type="text"
                  required
                  value={bulkPeriode}
                  onChange={(e) => setBulkPeriode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all">Upload Massal</button>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">Daftar Dokumen Slip Ubar</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Cari periode atau nama..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Nama Pejuang</th>
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3">Nama Berkas</th>
                <th className="py-2.5 px-3 text-right">Unduh Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSlips.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 italic">Belum ada dokumen slip ubar.</td>
                </tr>
              ) : (
                filteredSlips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold">{slip.pejuangName}</td>
                    <td className="py-3 px-3 text-emerald-600 font-bold">{slip.periode}</td>
                    <td className="py-3 px-3">
                      <span className="truncate max-w-[150px] inline-block">{slip.fileName}</span>
                      {slip.filePassword && (
                        <span className="ml-2 inline-flex items-center text-[10px] text-amber-600 border border-amber-200 bg-amber-50 px-1 rounded">
                          <Lock className="w-3 h-3 mr-1" /> Berkata Sandi
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right flex justify-end gap-2">
                      {slip.filePassword && (
                        <button
                          onClick={() => {
                            setRevealSlipId(slip.id);
                            setRevealPasswordInput('');
                            setRevealedPassword('');
                            setRevealError('');
                          }}
                          className="py-1.5 px-3 rounded-xl bg-amber-600 text-white font-bold text-[11px]"
                        >
                          <Key className="w-3.5 h-3.5 inline mr-1" /> Sandi
                        </button>
                      )}
                      <a href={slip.fileUrl} target="_blank" rel="noreferrer" className="py-1.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-[11px]">
                        <Download className="w-3.5 h-3.5 inline mr-1" /> Buka
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal Sandi */}
      {revealSlipId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-center mb-4 text-slate-800 dark:text-slate-100">Akses Sandi Slip Ubar</h3>
            {revealedPassword ? (
              <div className="text-center space-y-4">
                <p className="text-xs text-slate-500">Kata sandi file PDF Anda:</p>
                <div className="text-xl font-mono font-black text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  {revealedPassword}
                </div>
                <button onClick={() => setRevealSlipId('')} className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs">Tutup</button>
              </div>
            ) : (
              <form onSubmit={handleRevealPassword} className="space-y-4">
                {revealError && <div className="p-2 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold text-center">{revealError}</div>}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 text-center">Masukkan Kata Sandi Akun Anda</label>
                  <input
                    type="password"
                    required
                    value={revealPasswordInput}
                    onChange={(e) => setRevealPasswordInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 text-center font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setRevealSlipId('')} className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs">Batal</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">Buka</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
"""

content = content + missing_code

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)
