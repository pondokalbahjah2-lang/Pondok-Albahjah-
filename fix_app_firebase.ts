import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace("import('./lib/firebase')", "import('./utils/firebase')");
fs.writeFileSync('src/App.tsx', content);
