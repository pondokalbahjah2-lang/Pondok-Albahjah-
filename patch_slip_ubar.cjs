const fs = require('fs');
let content = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf8');

// Remove showEmailModal, emailStatusMsg, editingPasswords
content = content.replace(/const \[showEmailModal, setShowEmailModal\] = useState\(false\);\n/, '');
content = content.replace(/const \[emailStatusMsg, setEmailStatusMsg\] = useState\(''\);\n/, '');
content = content.replace(/const \[editingPasswords, setEditingPasswords\] = useState<Record<string, string>>\({}\);\n/, '');

// Add pagination states
content = content.replace(
  "const [stagedBulkFiles, setStagedBulkFiles] = useState<StagedBulkUpload[]>([]);",
  "const [stagedBulkFiles, setStagedBulkFiles] = useState<StagedBulkUpload[]>([]);\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;"
);

// Reset page on search
content = content.replace(
  "onChange={(e) => setSearchQuery(e.target.value)}",
  "onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}"
);

// Remove handleSendAllPasswordsEmail
const handleSendAll = `  const handleSendAllPasswordsEmail = () => {
    setEmailStatusMsg('Mengirim email otomatis kata sandi ke seluruh pejuang...');
    setTimeout(() => {
      setEmailStatusMsg(
        \`Berhasil! Informasi kata sandi terenkripsi telah dikirimkan via Email ke \${pejuangAccounts.length} Pejuang Al-Bahjah.\`
      );
    }, 1200);
  };`;
content = content.replace(handleSendAll, '');

// Remove the email trigger button
const emailTriggerHtml = `        {currentUser.role === 'Admin' && (
          <button
            onClick={() => {
              setShowEmailModal(true);
              setEmailStatusMsg('');
            }}
            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2 active:scale-95"
          >
            <Mail className="w-4 h-4" />
            <span>Kirim Informasi Kata Sandi ke Seluruh Pejuang via Email (1 Tombol)</span>
          </button>
        )}`;
content = content.replace(emailTriggerHtml, '');

// Remove the modal
const modalStart = `{showEmailModal && (`;
const modalEnd = `              </button>
            </div>
          </div>
        </div>
      )}`;
const modalIndex = content.indexOf(modalStart);
if (modalIndex !== -1) {
  const modalEndIndex = content.indexOf(modalEnd, modalIndex) + modalEnd.length;
  content = content.substring(0, modalIndex) + content.substring(modalEndIndex);
}

// Slice filteredSlips for pagination
content = content.replace(
  "filteredSlips.map((slip)",
  "filteredSlips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((slip)"
);

// Add Pagination Controls
const paginationControls = `
        {/* Pagination Controls */}
        {Math.ceil(filteredSlips.length / itemsPerPage) > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Halaman {currentPage} dari {Math.ceil(filteredSlips.length / itemsPerPage)}
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
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredSlips.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(filteredSlips.length / itemsPerPage)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
`;

content = content.replace(
  "</table>\n        </div>\n      </div>",
  "</table>\n        </div>\n" + paginationControls + "\n      </div>"
);

fs.writeFileSync('src/components/SlipUbarView.tsx', content);
