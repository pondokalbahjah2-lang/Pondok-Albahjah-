import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

if (!content.includes('import { DownloadCloud')) {
  content = "import { DownloadCloud } from 'lucide-react';\n" + content;
}

fs.writeFileSync('src/components/SettingsView.tsx', content);

console.log("Fixes applied");
