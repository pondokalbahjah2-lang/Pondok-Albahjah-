const fs = require('fs');
let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

// Add ImageModal state
code = code.replace(
  "const [confirmAction, setConfirmAction] = useState<{id: string, status: \"Valid\" | \"Ditolak\"} | null>(null);",
  "const [confirmAction, setConfirmAction] = useState<{id: string, status: \"Valid\" | \"Ditolak\"} | null>(null);\n  const [previewImage, setPreviewImage] = useState<string | null>(null);"
);

// Add the modal component at the end of the file, just before the last closing `</div>`
code = code.replace(
  "    </div>\n  );\n};\n",
  `
      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewImage(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.6 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl max-w-4xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white">Pratinjau Foto</h3>
              <button onClick={() => setPreviewImage(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-center">
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
              <a href={previewImage} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                Buka di Tab Baru
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
`
);

// Replace <a href={r.attendancePhotoUrl} ...>Lihat</a> with a button
code = code.replace(
  /<a href=\{r\.attendancePhotoUrl\} target="_blank" className="text-blue-500 underline">Lihat<\/a>/g,
  `<button onClick={() => setPreviewImage(r.attendancePhotoUrl)} className="text-blue-500 underline font-medium hover:text-blue-600">Lihat</button>`
);

// Replace <a href={r.notesPhotoUrl} ...>Lihat</a> with a button
code = code.replace(
  /<a href=\{r\.notesPhotoUrl\} target="_blank" className="text-blue-500 underline">Lihat<\/a>/g,
  `<button onClick={() => setPreviewImage(r.notesPhotoUrl)} className="text-blue-500 underline font-medium hover:text-blue-600">Lihat</button>`
);

fs.writeFileSync('src/components/KajianView.tsx', code);
console.log('Patched KajianView.tsx modals');
