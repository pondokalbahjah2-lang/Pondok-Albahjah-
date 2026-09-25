import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

if (!content.includes('DownloadCloud')) {
  content = content.replace("import {", "import { DownloadCloud,");
  fs.writeFileSync('src/components/SettingsView.tsx', content);
}
