const fs = require('fs');

// 1. App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes("let unsubNotif:")) {
  appCode = appCode.replace(
    "let unsubUsers: () => void;",
    "let unsubUsers: () => void;\n    let unsubNotif: () => void;"
  );
  fs.writeFileSync('src/App.tsx', appCode);
}

// 2. iOSGlassLayout.tsx
let iosCode = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');
// Check if {unreadNotifications.map(l => ( or similar exists
iosCode = iosCode.replace(/\{unreadNotifications\.map\(\(n: any\) => \(/g, "{unreadNotifications.map(n => (");
iosCode = iosCode.replace(/\{unreadNotifications\.map\(n => \(/g, "{unreadNotifications.map((n: any) => (");

// Wait, the error is: Cannot find name 'l'. Did you mean 'L'?
// This means somewhere there's a reference to `l`. Let's find it.
const lines = iosCode.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{l.id}') || lines[i].includes('l.jenisCuti') || lines[i].includes('l.catatanAdmin')) {
    lines[i] = lines[i].replace(/l\./g, 'n.');
  }
}
fs.writeFileSync('src/components/iOSGlassLayout.tsx', lines.join('\n'));

console.log('Fixed final errors');
