const fs = require('fs');

let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

if (!code.includes('const [itemsPerPage, setItemsPerPage]')) {
    code = code.replace('const itemsPerPage = 10;', 'const [itemsPerPage, setItemsPerPage] = useState(10);');
}

const paginationUI = `
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Tampilkan:</span>
              <select 
                value={itemsPerPage} 
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-xs border-none"
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={1000000}>Semua</option>
              </select>
            </div>
            
            {myAttendance.filter(rec => 
              rec.pejuangName.toLowerCase().includes(searchQuery.toLowerCase()) || 
              rec.date.toLowerCase().includes(searchQuery.toLowerCase())
            ).length > itemsPerPage && (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-slate-500 mr-2">
                  Halaman {currentPage} dari {Math.ceil(myAttendance.filter(rec => rec.pejuangName.toLowerCase().includes(searchQuery.toLowerCase()) || rec.date.toLowerCase().includes(searchQuery.toLowerCase())).length / itemsPerPage)}
                </span>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={currentPage >= Math.ceil(myAttendance.filter(rec => rec.pejuangName.toLowerCase().includes(searchQuery.toLowerCase()) || rec.date.toLowerCase().includes(searchQuery.toLowerCase())).length / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Berikutnya
                </button>
              </div>
            )}
          </div>`;

code = code.replace(/\{\/\* Pagination Controls \*\/\}[\s\S]*?<\/div>\n          \)}/, paginationUI);

fs.writeFileSync('src/components/AbsensiView.tsx', code);
console.log('Patched Pagination Absensi');
