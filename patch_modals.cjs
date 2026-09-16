const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/**/*.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add framer-motion import if not exists
  if (content.includes('fixed inset-0') && !content.includes('motion.div')) {
    if (!content.includes('framer-motion')) {
      content = "import { motion, AnimatePresence } from 'framer-motion';\n" + content;
    }
  }

  // Regex to find: <div className="fixed inset-0 ..."> ... <div className="..."
  const regex = /(<div className="fixed inset-0[^>]*>[\s\S]*?)<div\s+className="([^"]*(?:bg-white|bg-slate-900|bg-slate-800)[^"]*rounded-[^"]*)"([^>]*)>/g;
  
  content = content.replace(regex, (match, overlay, className, rest) => {
    changed = true;
    return overlay + `<motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="${className}"${rest}>`;
  });

  content = content.replace(/<\/motion\.div>\s*<\/div>\s*\)\}/g, (match) => {
    // We can't blindly replace closing divs without knowing where motion.div closes
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
}
