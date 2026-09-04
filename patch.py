with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

target = """          {/* Bulk Upload via CSV */}
          <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Upload Slip Ubar Massal (Format Teks)</span>
            </h2>
            <form onSubmit={handleBulkUploadSlip} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Format CSV (Pisahkan dengan koma)
                </label>
                <textarea
                  required
                  rows={6}
                  value={bulkCsvText}
                  onChange={(e) => setBulkCsvText(e.target.value)}
                  placeholder="Nama Pejuang, Link GDrive, Password (opsional)&#10;Budi Santoso, https://drive.google.com/..., 123456&#10;Andi, https://drive.google.com/..., "
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>"""

replacement = """          {/* Bulk Upload Dynamic */}
          <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Upload Slip Ubar Massal</span>
            </h2>
            <form onSubmit={handleBulkUploadSlip} className="space-y-3">
              <div className="space-y-2">
                {bulkRows.map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      required
                      value={row.pejuangId}
                      onChange={(e) => {
                        const newRows = [...bulkRows];
                        newRows[index].pejuangId = e.target.value;
                        setBulkRows(newRows);
                      }}
                      className="w-1/3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    >
                      <option value="">-- Pejuang --</option>
                      {pejuangAccounts.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input
                      type="url"
                      required
                      placeholder="Link GDrive..."
                      value={row.gdriveLink}
                      onChange={(e) => {
                        const newRows = [...bulkRows];
                        newRows[index].gdriveLink = e.target.value;
                        setBulkRows(newRows);
                      }}
                      className="w-1/3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="Password..."
                      value={row.password}
                      onChange={(e) => {
                        const newRows = [...bulkRows];
                        newRows[index].password = e.target.value;
                        setBulkRows(newRows);
                      }}
                      className="w-1/4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newRows = bulkRows.filter((_, i) => i !== index);
                        setBulkRows(newRows);
                      }}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setBulkRows([...bulkRows, { pejuangId: '', gdriveLink: '', password: '' }])}
                className="w-full py-2 border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs"
              >
                + Tambah Baris Pejuang
              </button>"""

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content.replace(target, replacement))
