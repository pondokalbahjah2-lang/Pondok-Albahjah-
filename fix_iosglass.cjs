const fs = require('fs');
let code = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');

code = code.replace(/Cuti \(\{l\.tanggalMulai\}\) disetujui!/g, "{n.title}");
fs.writeFileSync('src/components/iOSGlassLayout.tsx', code);
