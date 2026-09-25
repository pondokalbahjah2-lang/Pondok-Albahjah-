const fs = require('fs');

function replaceSearch(file, oldStr, newStr) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
    
    // add framer motion import if missing
    if (!content.includes("import { motion }")) {
      content = content.replace(/import ([^\n]+)\n/, (match) => {
        return match + `import { motion } from 'framer-motion';\n`;
      });
    }
    
    fs.writeFileSync(file, content);
    console.log(`Patched search in ${file}`);
  } else {
    console.log(`Search pattern not found in ${file}`);
  }
}

// 1. DashboardView.tsx
const oldDash = `          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pejuang atau amanah..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
            />
          </div>`;
          
const newDash = `          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative rounded-2xl p-[2px] bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm"
          >
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pejuang atau amanah..."
                className="w-full pl-10 pr-4 py-2.5 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>
          </motion.div>`;
          
replaceSearch('src/components/DashboardView.tsx', oldDash, newDash);

