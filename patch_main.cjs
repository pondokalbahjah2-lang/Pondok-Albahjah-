const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

const pwaImport = `import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

`;

content = pwaImport + content;
fs.writeFileSync('src/main.tsx', content);
