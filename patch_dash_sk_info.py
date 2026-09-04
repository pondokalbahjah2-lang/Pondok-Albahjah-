import re

with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

sk_info_ui = """
            {currentUser.role === 'Pejuang' && (currentUser.suratKeputusanUrl || currentUser.pkwtStart || currentUser.pkwtEnd) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {currentUser.suratKeputusanUrl && (
                  <a 
                    href={currentUser.suratKeputusanUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md text-[10px] font-bold border border-emerald-200 dark:border-emerald-800"
                  >
                    <FileText className="w-3 h-3" />
                    Lihat SK
                  </a>
                )}
                {(currentUser.pkwtStart || currentUser.pkwtEnd) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                    <Calendar className="w-3 h-3" />
                    PKWT: {currentUser.pkwtStart || '?'} s.d {currentUser.pkwtEnd || '?'}
                  </span>
                )}
              </div>
            )}
"""

target = r"(<p className=\"text-sm text-slate-500 dark:text-slate-400\">\s*Amanah: \{currentUser\.amanah\} \(\{currentUser\.subDivisi\}\)\s*</p>)"
content = re.sub(target, r"\1" + sk_info_ui, content)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
