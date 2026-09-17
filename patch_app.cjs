const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// DashboardView props
code = code.replace(
    /currentUser=\{currentUser\}\s+accounts=\{accounts\}/g,
    "currentUser={currentUser}\n                accounts={accounts}\n                kajianRecords={kajianRecords}"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx');
