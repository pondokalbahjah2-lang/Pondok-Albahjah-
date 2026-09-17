const fs = require('fs');
let izinCode = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');

// I already attempted to patch IzinKeluarView imports but it may have missed it if the search text didn't match.
if (!izinCode.includes("import { doc, setDoc, collection }")) {
  izinCode = izinCode.replace(
    "import { getLocalDateString, getFormattedTime } from '../utils/dateUtils';",
    "import { getLocalDateString, getFormattedTime } from '../utils/dateUtils';\nimport { doc, setDoc, collection } from 'firebase/firestore';\nimport { db } from '../utils/firebase';"
  );
  fs.writeFileSync('src/components/IzinKeluarView.tsx', izinCode);
}

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes("let unsubNotif: () => void;")) {
  appCode = appCode.replace(
    "let unsubUsers: () => void;",
    "let unsubUsers: () => void;\n    let unsubNotif: () => void;"
  );
}
if (!appCode.includes("const handleMarkNotificationRead")) {
  appCode = appCode.replace(
    "const handleSaveAccounts = async (newAccounts: UserAccount[]) => {",
    "const handleMarkNotificationRead = async (id: string) => {\n    try {\n      await setDoc(doc(db, 'notifications', id), { read: true }, { merge: true });\n    } catch (e) {\n      console.error('Error marking notification as read:', e);\n    }\n  };\n\n  const handleSaveAccounts = async (newAccounts: UserAccount[]) => {"
  );
}
fs.writeFileSync('src/App.tsx', appCode);

console.log('Patched last errors');
