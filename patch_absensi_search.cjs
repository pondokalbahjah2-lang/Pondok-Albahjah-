const fs = require('fs');
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

// 1. Add searchQuery state
content = content.replace(
  "const [currentPage, setCurrentPage] = useState(1);",
  "const [currentPage, setCurrentPage] = useState(1);\n  const [searchQuery, setSearchQuery] = useState('');"
);

// 2. Add Search Bar to the header
const headerReplace = `<div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Riwayat & Log Presensi Kehadiran
            </h2>
            <span className="text-xs text-slate-500">
              Total {myAttendance.length} Entri
            </span>
          </div>`;

const newHeader = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Riwayat & Log Presensi Kehadiran
            </h2>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Cari nama atau tanggal..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full md:w-48 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">
                Total {myAttendance.length} Entri
              </span>
            </div>
          </div>`;

content = content.replace(headerReplace, newHeader);

// 3. Filter myAttendance with searchQuery before slicing
// We define filteredAttendance just before using it
const mapReplace = `myAttendance.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((rec) => (`;

const newMapReplace = `myAttendance
                  .filter(rec => 
                    rec.pejuangName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    rec.date.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((rec) => (`

content = content.replace(mapReplace, newMapReplace);

// Also need to adjust pagination logic to use filtered length
content = content.replace(
  "{Math.ceil(myAttendance.length / itemsPerPage) > 1 && (",
  "{Math.ceil(myAttendance.filter(rec => rec.pejuangName.toLowerCase().includes(searchQuery.toLowerCase()) || rec.date.toLowerCase().includes(searchQuery.toLowerCase())).length / itemsPerPage) > 1 && ("
);
content = content.replace(
  "Halaman {currentPage} dari {Math.ceil(myAttendance.length / itemsPerPage)}",
  "Halaman {currentPage} dari {Math.ceil(myAttendance.filter(rec => rec.pejuangName.toLowerCase().includes(searchQuery.toLowerCase()) || rec.date.toLowerCase().includes(searchQuery.toLowerCase())).length / itemsPerPage)}"
);
content = content.replace(
  "Math.ceil(myAttendance.length / itemsPerPage)",
  "Math.ceil(myAttendance.filter(rec => rec.pejuangName.toLowerCase().includes(searchQuery.toLowerCase()) || rec.date.toLowerCase().includes(searchQuery.toLowerCase())).length / itemsPerPage)"
);
content = content.replace(
  "Math.ceil(myAttendance.length / itemsPerPage)",
  "Math.ceil(myAttendance.filter(rec => rec.pejuangName.toLowerCase().includes(searchQuery.toLowerCase()) || rec.date.toLowerCase().includes(searchQuery.toLowerCase())).length / itemsPerPage)"
);

fs.writeFileSync('src/components/AbsensiView.tsx', content);
