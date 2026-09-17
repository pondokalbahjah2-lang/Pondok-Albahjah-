const fs = require('fs');

// 1. Fix types.ts (remove duplicate history)
let typesCode = fs.readFileSync('src/types.ts', 'utf8');
typesCode = typesCode.replace(
  "  history?: { status: string, by: string, timestamp: string }[];\n  history?: { status: string, by: string, timestamp: string }[];",
  "  history?: { status: string, by: string, timestamp: string }[];"
);
fs.writeFileSync('src/types.ts', typesCode);

// 2. Fix App.tsx (unsubNotif and timestamp and handleMarkNotificationRead)
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  "const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));",
  "const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));"
);
appCode = appCode.replace(
  "        cutiApprovers={generalSettings.cutiApprovers}\n        notifications={notifications}\n        onMarkNotificationRead={handleMarkNotificationRead}",
  "        cutiApprovers={generalSettings.cutiApprovers}\n        notifications={notifications}\n        onMarkNotificationRead={handleMarkNotificationRead}"
);
if (!appCode.includes("const handleMarkNotificationRead")) {
  appCode = appCode.replace(
    "  const handleSaveAccounts = async (newAccounts: UserAccount[]) => {",
    "  const handleMarkNotificationRead = async (id: string) => {\n    try {\n      await setDoc(doc(db, 'notifications', id), { read: true }, { merge: true });\n    } catch (e) {\n      console.error('Error marking notification as read:', e);\n    }\n  };\n\n  const handleSaveAccounts = async (newAccounts: UserAccount[]) => {"
  );
}
if (!appCode.includes("let unsubNotif: () => void;")) {
  appCode = appCode.replace(
    "let unsubUsers: () => void;",
    "let unsubUsers: () => void;\n    let unsubNotif: () => void;"
  );
}
fs.writeFileSync('src/App.tsx', appCode);

// 3. Fix IzinKeluarView.tsx
let izinCode = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');
if (!izinCode.includes("import { doc, setDoc, collection }")) {
  izinCode = izinCode.replace(
    "import { getLocalDateString, getFormattedTime } from '../utils/dateUtils';",
    "import { getLocalDateString, getFormattedTime } from '../utils/dateUtils';\nimport { doc, setDoc, collection } from 'firebase/firestore';\nimport { db } from '../utils/firebase';"
  );
  fs.writeFileSync('src/components/IzinKeluarView.tsx', izinCode);
}

// 4. Fix iOSGlassLayout.tsx
let iosCode = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');
iosCode = iosCode.replace(/\{approvedLeaves\.map/g, "{unreadNotifications.map");
fs.writeFileSync('src/components/iOSGlassLayout.tsx', iosCode);

console.log('Patched errors');
