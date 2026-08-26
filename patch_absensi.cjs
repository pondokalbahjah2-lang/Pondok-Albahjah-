const fs = require('fs');
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

content = content.replace(
  "const [attendanceStatus, setAttendanceStatus] = useState<'Hadir' | 'Sakit' | 'Libur' | 'Pulang'>('Hadir');",
  "const [attendanceStatus, setAttendanceStatus] = useState<'Hadir' | 'Sakit' | 'Libur' | 'Pulang'>('Hadir');\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;"
);

content = content.replace(
  "myAttendance.map((rec) =>",
  "myAttendance.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((rec) =>"
);

const paginationHtml = `</table>
              </div>
              
              {/* Pagination Controls */}
              {Math.ceil(myAttendance.length / itemsPerPage) > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    Halaman {currentPage} dari {Math.ceil(myAttendance.length / itemsPerPage)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(myAttendance.length / itemsPerPage), prev + 1))}
                      disabled={currentPage === Math.ceil(myAttendance.length / itemsPerPage)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>`;

content = content.replace(
  "</table>\n              </div>\n            </div>",
  paginationHtml
);

fs.writeFileSync('src/components/AbsensiView.tsx', content);
