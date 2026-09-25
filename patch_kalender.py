with open("src/components/KalenderView.tsx", "r") as f:
    content = f.read()

target = """        </div>
        {currentUser.role === 'Admin' && (
          <div className="flex items-center bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 whitespace-nowrap">Divisi:</span>
            <select
              value={divisiFilter}
              onChange={(e) => setDivisiFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none w-28 cursor-pointer"
            >
              {subDivisiList.map(sd => (
                <option key={sd} value={sd} className="text-slate-800 dark:text-slate-100">{sd}</option>
              ))}
            </select>
          </div>
        )}
      </div>"""

replacement = """        </div>
        <div className="flex items-center gap-3">
          {currentUser.role === 'Admin' ? (
            <div className="flex items-center bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 whitespace-nowrap">Divisi:</span>
              <select
                value={divisiFilter}
                onChange={(e) => setDivisiFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none w-28 cursor-pointer"
              >
                {subDivisiList.map(sd => (
                  <option key={sd} value={sd} className="text-slate-800 dark:text-slate-100">{sd}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center bg-white/50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  viewMode === 'all'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Semua Cuti
              </button>
              <button
                onClick={() => setViewMode('me')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  viewMode === 'me'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Cuti Saya
              </button>
            </div>
          )}
        </div>
      </div>"""

with open("src/components/KalenderView.tsx", "w") as f:
    f.write(content.replace(target, replacement))
