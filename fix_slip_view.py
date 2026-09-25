import re
with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

content = content.replace("  onUpdateAccountPassword?: (pejuangId: string, newPass: string) => void;\n}", "  onUpdateAccountPassword?: (pejuangId: string, newPass: string) => void;\n  onDeleteAllSlipUbar?: () => void;\n}")

content = content.replace("  onUpdateAccountPassword,\n}) => {", "  onUpdateAccountPassword,\n  onDeleteAllSlipUbar,\n}) => {")

state_code = "  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);"
content = content.replace("  const [currentPage, setCurrentPage] = useState(1);", "  const [currentPage, setCurrentPage] = useState(1);\n" + state_code)

btn_old = """            {currentUser.role === 'Admin' && slipUbarList.length > 0 && (
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
            )}"""

btn_new = """            {currentUser.role === 'Admin' && slipUbarList.length > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold text-[10px] transition-colors"
              >
                Hapus Semua
              </button>
            )}"""
content = content.replace(btn_old, btn_new)


modal_code = """      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-center mb-4 text-rose-600 dark:text-rose-500">Peringatan Penghapusan</h3>
            <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-6">
              Apakah Anda yakin ingin menghapus SELURUH dokumen slip ubar? Tindakan ini tidak dapat dibatalkan dan seluruh data akan hilang secara permanen.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  if (onDeleteAllSlipUbar) onDeleteAllSlipUbar();
                  else onSaveSlipUbar([]);
                  setShowDeleteConfirm(false);
                }} 
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}"""

idx = content.rfind("    </div>\n  );\n};")
content = content[:idx] + modal_code + "\n" + content[idx:]

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)
