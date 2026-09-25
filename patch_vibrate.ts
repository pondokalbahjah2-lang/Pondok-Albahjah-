import fs from 'fs';

// Helper function
function addVibrateToSuccess(file: string, matchRegex: RegExp, replaceStr: string) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(matchRegex, replaceStr);
  fs.writeFileSync(file, content);
}

addVibrateToSuccess(
  'src/components/AbsensiView.tsx',
  /alert\(\`Jam Pulang Berhasil Dicatat: \$\{timeStr\}\`\);/,
  "if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);\n      alert(`Jam Pulang Berhasil Dicatat: ${timeStr}`);"
);

addVibrateToSuccess(
  'src/components/AbsensiView.tsx',
  /alert\(\`Absensi Kehadiran Berhasil Ditambahkan dengan Status: \$\{finalStatus\}\`\);/,
  "if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);\n    alert(`Absensi Kehadiran Berhasil Ditambahkan dengan Status: ${finalStatus}`);"
);

addVibrateToSuccess(
  'src/components/AbsensiView.tsx',
  /alert\(\`Quick Check-in Berhasil dengan Status: \$\{finalStatus\}\`\);/,
  "if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);\n      alert(`Quick Check-in Berhasil dengan Status: ${finalStatus}`);"
);

// IzinKeluarView
let izinContent = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf-8');
izinContent = izinContent.replace(
  /alert\('Izin keluar berhasil diajukan!'\);/,
  "if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);\n    alert('Izin keluar berhasil diajukan!');"
);
fs.writeFileSync('src/components/IzinKeluarView.tsx', izinContent);
