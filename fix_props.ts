import fs from 'fs';
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf-8');
content = content.replace(
  "slipUbarList: SlipUbarRecord[];\n}",
  "slipUbarList: SlipUbarRecord[];\n  schedules?: any[];\n}"
);
content = content.replace(
  "slipUbarList,\n}) => {",
  "slipUbarList,\n  schedules,\n}) => {"
);
fs.writeFileSync('src/components/LaporanView.tsx', content);
