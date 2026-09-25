import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The LaporanView might be visible to Pejuang.
// We need to check the Navigation sidebar in App.tsx.
console.log(content.match(/<button[^>]*>[\s\S]*?laporan[\s\S]*?<\/button>/gi)?.join('\n\n'));

