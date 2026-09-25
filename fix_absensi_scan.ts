import fs from 'fs';
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

content = content.replace(
  /\{isScanningQR && \(/g,
  "{isCameraOpen && ("
);

fs.writeFileSync('src/components/AbsensiView.tsx', content);
