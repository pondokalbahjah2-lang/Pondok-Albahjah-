const fs = require('fs');

const file = 'src/components/SettingsView.tsx';
let content = fs.readFileSync(file, 'utf-8');

// replace templateizin button
content = content.replace(
  /<button\n\s*type="button"\n\s*disabled={isUploadingTemplate}\n\s*onClick={\(\) => templateInputRef\.current\?\.click\(\)}\n\s*className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1\.5 disabled:opacity-50"\n\s*>\n\s*<Upload className="w-3\.5 h-3\.5" \/>\n\s*<span>{isUploadingTemplate \? 'Mengunggah\.\.\.' : 'Unggah Template \(JPG\/PNG\)'}<\/span>\n\s*<\/button>/g,
  `<motion.button
                      type="button"
                      disabled={isUploadingTemplate}
                      onClick={() => templateInputRef.current?.click()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingTemplate ? 'Mengunggah...' : 'Unggah Template (JPG/PNG)'}</span>
                    </motion.button>`
);

content = content.replace(
  /<button\n\s*type="button"\n\s*disabled={isUploadingTemplateCuti}\n\s*onClick={\(\) => templateCutiInputRef\.current\?\.click\(\)}\n\s*className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1\.5 disabled:opacity-50"\n\s*>\n\s*<Upload className="w-3\.5 h-3\.5" \/>\n\s*<span>{isUploadingTemplateCuti \? 'Mengunggah\.\.\.' : 'Unggah Template Cuti \(JPG\/PNG\)'}<\/span>\n\s*<\/button>/g,
  `<motion.button
                        type="button"
                        disabled={isUploadingTemplateCuti}
                        onClick={() => templateCutiInputRef.current?.click()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingTemplateCuti ? 'Mengunggah...' : 'Unggah Template Cuti (JPG/PNG)'}</span>
                      </motion.button>`
);

fs.writeFileSync(file, content);
console.log("Patched missing upload buttons");

