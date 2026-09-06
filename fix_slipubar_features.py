import re

with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

# Add pagination logic and Hapus Semua button

pagination_code = """          </table>
          {Math.ceil(filteredSlips.length / itemsPerPage) > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 text-xs font-bold"
              >
                Sebelumnya
              </button>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Halaman {currentPage} dari {Math.ceil(filteredSlips.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredSlips.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(filteredSlips.length / itemsPerPage)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 text-xs font-bold"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>"""

content = content.replace("          </table>\n        </div>", pagination_code)

header_code_search = """        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">Daftar Dokumen Slip Ubar</h2>"""

header_code_replacement = """        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">Daftar Dokumen Slip Ubar</h2>
            {currentUser.role === 'Admin' && slipUbarList.length > 0 && (
              <button
                onClick={() => {
                  if(window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SELURUH dokumen slip ubar? Tindakan ini tidak dapat dibatalkan.')) {
                    onSaveSlipUbar([]);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold text-[10px] transition-colors"
              >
                Hapus Semua
              </button>
            )}
          </div>"""

content = content.replace(header_code_search, header_code_replacement)

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)
