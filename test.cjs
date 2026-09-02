const fs = require('fs');
console.log(fs.readFileSync('src/components/LaporanView.tsx', 'utf8').substring(15000, 16000));
