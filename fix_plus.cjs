const fs = require('fs');

let izinCode = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');
izinCode = izinCode.replace("AlertTriangle } from 'lucide-react';", "AlertTriangle, Plus } from 'lucide-react';");
fs.writeFileSync('src/components/IzinKeluarView.tsx', izinCode);

console.log('Added Plus to IzinKeluarView');
