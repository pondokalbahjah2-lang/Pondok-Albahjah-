import fs from 'fs';

let izinContent = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf-8');
izinContent = izinContent.replace(
  /onSaveExitPermissions\(\[newRecord, \.\.\.exitPermissions\]\);/,
  "if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);\n    onSaveExitPermissions([newRecord, ...exitPermissions]);"
);

izinContent = izinContent.replace(
  /onSaveExitPermissions\(updated\);/,
  "if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);\n    onSaveExitPermissions(updated);"
);

fs.writeFileSync('src/components/IzinKeluarView.tsx', izinContent);
