import fs from 'fs';
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf-8');
content = content.replace(/pejuangAccounts\.forEach\(\(p, idx\) => \{/g, "accounts.forEach((p, idx) => {");
fs.writeFileSync('src/components/LaporanView.tsx', content);
