const fs = require('fs');
let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

const targetPagination = `                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Image Modal Viewer */}`;

const paginationReplacement = `                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {myAttendance.filter(rec => 
            rec.pejuangName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            rec.date.toLowerCase().includes(searchQuery.toLowerCase())
          ).length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-slate-500">
                Menampilkan halaman {currentPage} dari {Math.ceil(myAttendance.filter(rec => rec.pejuangName.toLowerCase().includes(searchQuery.toLowerCase()) || rec.date.toLowerCase().includes(searchQuery.toLowerCase())).length / itemsPerPage)}
              </span>
              <div className="flex gap-2">
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
            </div>
          )}
        </div>
      </div>
      
      {/* Image Modal Viewer */}`;

code = code.replace(targetPagination, paginationReplacement);
fs.writeFileSync('src/components/AbsensiView.tsx', code);
console.log('patched pagination controls');
