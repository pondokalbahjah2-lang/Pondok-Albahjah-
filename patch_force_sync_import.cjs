const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("await import('./lib/firebase')", "await import('./utils/firebase')");
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed firebase import path in App.tsx');
