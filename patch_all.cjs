const fs = require('fs');

const replacements = [
  {
    file: 'src/components/IzinKeluarView.tsx',
    old: `        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Cari nama pejuang atau alasan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>`,
    new: `        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative w-full sm:w-80 rounded-2xl p-[2px] bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm"
        >
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Cari nama pejuang atau alasan..."
              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>
        </motion.div>`
  },
  {
    file: 'src/components/CutiView.tsx',
    old: `        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari nama pejuang atau alasan cuti..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none text-slate-700 dark:text-slate-200"
          />
        </div>`,
    new: `        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative rounded-2xl p-[2px] bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm"
        >
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama pejuang atau alasan cuti..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-3 bg-transparent text-sm focus:outline-none text-slate-700 dark:text-slate-200"
            />
          </div>
        </motion.div>`
  },
  {
    file: 'src/components/AuditLogView.tsx',
    old: `      <div className="p-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text"
          placeholder="Cari aktivitas, nama admin, atau detail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 w-full placeholder-slate-400"
        />
      </div>`,
    new: `      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="rounded-2xl p-[2px] bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm"
      >
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari aktivitas, nama admin, atau detail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 w-full placeholder-slate-400"
          />
        </div>
      </motion.div>`
  },
  {
    file: 'src/components/AbsensiView.tsx',
    old: `              <input
                type="text"
                placeholder="Cari nama atau tanggal..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full md:w-48 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />`,
    new: `              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="w-full md:w-48 rounded-xl p-[2px] bg-gradient-to-r from-emerald-400 to-teal-500"
              >
                <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden flex items-center">
                  <input
                    type="text"
                    placeholder="Cari nama atau tanggal..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full py-1.5 px-3 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </motion.div>`
  },
  {
    file: 'src/components/LaporanView.tsx',
    old: `              <input
                type="text"
                placeholder="Cari nama pejuang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />`,
    new: `              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="w-full sm:w-1/3 rounded-2xl p-[2px] bg-gradient-to-r from-emerald-400 to-teal-500"
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex items-center">
                  <input
                    type="text"
                    placeholder="Cari nama pejuang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2.5 bg-transparent text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </motion.div>`
  },
  {
    file: 'src/components/SettingsView.tsx',
    old: `              <input
                type="text"
                placeholder="Cari nama, username, atau ID..."
                value={pejuangSearchQuery}
                onChange={(e) => {
                  setPejuangSearchQuery(e.target.value);
                  setPejuangCurrentPage(1);
                }}
                className="w-48 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />`,
    new: `              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="w-48 rounded-xl p-[2px] bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm"
              >
                <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden flex items-center">
                  <input
                    type="text"
                    placeholder="Cari nama, username, atau ID..."
                    value={pejuangSearchQuery}
                    onChange={(e) => {
                      setPejuangSearchQuery(e.target.value);
                      setPejuangCurrentPage(1);
                    }}
                    className="w-full py-1.5 px-3 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </motion.div>`
  },
  {
    file: 'src/components/SettingsView.tsx',
    old: `              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-500 transition-colors"
                title="Unggah Foto"
              >
                <Upload className="w-4 h-4" />
              </button>`,
    new: `              <motion.button 
                onClick={() => fileInputRef.current?.click()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-500 transition-colors"
                title="Unggah Foto"
              >
                <Upload className="w-4 h-4" />
              </motion.button>`
  },
  {
    file: 'src/components/SettingsView.tsx',
    old: `                    <button
                      type="button"
                      disabled={isUploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingLogo ? 'Mengunggah...' : 'Unggah Logo Baru (JPG/PNG)'}</span>
                    </button>`,
    new: `                    <motion.button
                      type="button"
                      disabled={isUploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingLogo ? 'Mengunggah...' : 'Unggah Logo Baru (JPG/PNG)'}</span>
                    </motion.button>`
  },
  {
    file: 'src/components/SettingsView.tsx',
    old: `                      <button
                        type="button"
                        disabled={isUploadingTemplate}
                        onClick={() => templateInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingTemplate ? 'Mengunggah...' : 'Unggah Template (JPG/PNG)'}</span>
                      </button>`,
    new: `                      <motion.button
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
  },
  {
    file: 'src/components/SettingsView.tsx',
    old: `                        <button
                          type="button"
                          disabled={isUploadingTemplateCuti}
                          onClick={() => templateCutiInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingTemplateCuti ? 'Mengunggah...' : 'Unggah Template Cuti (JPG/PNG)'}</span>
                        </button>`,
    new: `                        <motion.button
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
  }
];

for (const rep of replacements) {
  if (!fs.existsSync(rep.file)) continue;
  let content = fs.readFileSync(rep.file, 'utf-8');
  
  if (content.includes(rep.old)) {
    content = content.replace(rep.old, rep.new);
    
    // add framer motion import if missing
    if (!content.includes("import { motion }")) {
      content = content.replace(/import ([^\n]+)\n/, (match) => {
        return match + `import { motion } from 'framer-motion';\n`;
      });
    }
    
    fs.writeFileSync(rep.file, content);
    console.log(`Patched in ${rep.file}`);
  } else {
    console.log(`Pattern not found in ${rep.file}`);
  }
}
