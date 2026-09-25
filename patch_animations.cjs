const fs = require('fs');
const glob = require('glob'); // maybe not available, let's just do an array of files

const files = [
  'src/components/DashboardView.tsx',
  'src/components/LaporanView.tsx',
  'src/components/AbsensiView.tsx',
  'src/components/SettingsView.tsx',
  'src/components/AuditLogView.tsx',
  'src/components/CutiView.tsx',
  'src/components/IzinKeluarView.tsx',
  'src/components/KajianView.tsx',
  'src/components/SlipUbarView.tsx',
  'src/components/SuratTeguranView.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Add framer-motion import if needed
  if (!content.includes("import { motion }")) {
    // find first import and insert after
    content = content.replace(/import ([^\n]+)\n/, (match) => {
      return match + `import { motion } from 'framer-motion';\n`;
    });
    changed = true;
  }

  // 1. Search Bar Animation
  // Look for a div that contains <Search ... /> and <input ... />
  // We'll use a regex that matches:
  // <div className="[^"]*relative[^"]*w-full[^"]*">
  //   <Search className="[^"]*" />
  //   <input ... />
  // </div>
  // Wait, it's easier to just use string replacements because regex across multiple lines is tricky.

  const searchDivRegex = /<div className="relative w-full[^>]*>\s*<Search className="absolute [^>]*>\s*<input\s+type="text"[^>]*placeholder="Cari[^>]*\/>\s*<\/div>/g;
  
  // This might be too strict. Let's do a more robust approach.
  
  if (changed) {
    fs.writeFileSync(file, content);
  }
}
console.log("Script executed.");
