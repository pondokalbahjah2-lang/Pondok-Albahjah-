const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// Insert pagination states
content = content.replace(
  "const [newAmanah, setNewAmanah] = useState('Musyrif SMPIQu');",
  "const [newAmanah, setNewAmanah] = useState('Musyrif SMPIQu');\n  const [pejuangCurrentPage, setPejuangCurrentPage] = useState(1);\n  const pejuangItemsPerPage = 10;"
);

// Add search query for pejuang list (nice to have if paginated)
content = content.replace(
  "const [newAmanah, setNewAmanah] = useState('Musyrif SMPIQu');",
  "const [newAmanah, setNewAmanah] = useState('Musyrif SMPIQu');\n  const [pejuangSearchQuery, setPejuangSearchQuery] = useState('');"
);

// Update account map
const accountMapLogic = `{accounts.map((acc) => (`;
const newAccountMapLogic = `{accounts
                  .filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase()))
                  .slice((pejuangCurrentPage - 1) * pejuangItemsPerPage, pejuangCurrentPage * pejuangItemsPerPage)
                  .map((acc) => (`
content = content.replace(accountMapLogic, newAccountMapLogic);

// Add search bar
const headerToReplace = `<div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Manajemen Data Pejuang & Admin ({accounts.length} Akun)</span>
            </h2>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pejuang</span>
            </button>
          </div>`;

const searchBarHtml = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Manajemen Data Pejuang & Admin ({accounts.length} Akun)</span>
            </h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Cari nama atau username..."
                value={pejuangSearchQuery}
                onChange={(e) => {
                  setPejuangSearchQuery(e.target.value);
                  setPejuangCurrentPage(1);
                }}
                className="w-48 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setShowAddUserModal(true)}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pejuang</span>
              </button>
            </div>
          </div>`;

content = content.replace(headerToReplace, searchBarHtml);

// Add pagination controls
const tableEnd = `</table>
          </div>
        </div>
      )}`;

const paginationHtml = `</table>
          </div>
          
          {/* Pagination Controls */}
          {Math.ceil(accounts.filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase())).length / pejuangItemsPerPage) > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Halaman {pejuangCurrentPage} dari {Math.ceil(accounts.filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase())).length / pejuangItemsPerPage)}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPejuangCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={pejuangCurrentPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setPejuangCurrentPage(prev => Math.min(Math.ceil(accounts.filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase())).length / pejuangItemsPerPage), prev + 1))}
                  disabled={pejuangCurrentPage === Math.ceil(accounts.filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase())).length / pejuangItemsPerPage)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}`;

content = content.replace(tableEnd, paginationHtml);

fs.writeFileSync('src/components/SettingsView.tsx', content);
