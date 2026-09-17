const fs = require('fs');

let iosCode = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');

// I also need to update the properties inside unreadNotifications.map if it was using `l` instead of `n`
iosCode = iosCode.replace(/\{unreadNotifications\.map\(l => \(/g, "{unreadNotifications.map(n => (");
iosCode = iosCode.replace(/<div key=\{l\.id\}/g, "<div key={n.id} onClick={() => onMarkNotificationRead && onMarkNotificationRead(n.id)}");
iosCode = iosCode.replace(/Cuti \{l\.jenisCuti\} Disetujui!/g, "{n.title}");
iosCode = iosCode.replace(/\{l\.catatanAdmin \|\| 'Oleh Admin'\}/g, "{n.message}");

fs.writeFileSync('src/components/iOSGlassLayout.tsx', iosCode);
console.log('Patched iosCode variables');

