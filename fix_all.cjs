const fs = require('fs');

// 1. App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes("let unsubNotif: () => void;")) {
  appCode = appCode.replace("let unsubUsers: () => void;", "let unsubNotif: () => void;\n    let unsubUsers: () => void;");
}
if (!appCode.includes("const handleMarkNotificationRead")) {
  appCode = appCode.replace("const handleSaveAccounts", "const handleMarkNotificationRead = async (id: string) => { try { await setDoc(doc(db, 'notifications', id), { read: true }, { merge: true }); } catch (e) { console.error('Error marking notification as read:', e); } };\n\n  const handleSaveAccounts");
}
fs.writeFileSync('src/App.tsx', appCode);

// 2. IzinKeluarView.tsx
let izinCode = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');
if (!izinCode.includes("import { doc,")) {
  izinCode = izinCode.replace("import { getLocalDateString", "import { doc, setDoc, collection } from 'firebase/firestore';\nimport { db } from '../utils/firebase';\nimport { getLocalDateString");
  fs.writeFileSync('src/components/IzinKeluarView.tsx', izinCode);
}

// 3. iOSGlassLayout.tsx
let iosCode = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');
iosCode = iosCode.replace(/\{unreadNotifications\.map\(\(l\) => \(/g, "{unreadNotifications.map((n: any) => (");
iosCode = iosCode.replace(/\{unreadNotifications\.map\(l => \(/g, "{unreadNotifications.map((n: any) => (");
iosCode = iosCode.replace(/<div key=\{l\.id\}/g, "<div key={n.id} onClick={() => onMarkNotificationRead && onMarkNotificationRead(n.id)}");
iosCode = iosCode.replace(/Cuti \{l\.jenisCuti\} Disetujui!/g, "{n.title}");
iosCode = iosCode.replace(/\{l\.catatanAdmin \|\| 'Oleh Admin'\}/g, "{n.message}");
fs.writeFileSync('src/components/iOSGlassLayout.tsx', iosCode);

console.log('Fixed all syntax errors');
