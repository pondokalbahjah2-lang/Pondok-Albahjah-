const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// add AppNotification to imports
code = code.replace(
  "import { UserAccount, AttendanceRecord",
  "import { AppNotification, UserAccount, AttendanceRecord"
);

// add state
code = code.replace(
  "  const [kajianRecords, setKajianRecords] = useState<KajianRecord[]>(AppStorage.getKajianRecords());",
  "  const [kajianRecords, setKajianRecords] = useState<KajianRecord[]>(AppStorage.getKajianRecords());\n  const [notifications, setNotifications] = useState<AppNotification[]>([]);"
);

// add sync in useEffect
const syncCode = `
      // Sync Notifications
      const notifQuery = query(collection(db, 'notifications'), where('userId', '==', userAccount.id));
      const unsubNotif = onSnapshot(notifQuery, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
        setNotifications(notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      });
`;
code = code.replace(
  "      // Sync Accounts",
  syncCode + "\n      // Sync Accounts"
);

// add clean up
code = code.replace(
  "let unsubWarningLetters: () => void;",
  "let unsubWarningLetters: () => void;\n      let unsubNotif: () => void;"
);

// We need to find the correct place to put unsubNotif inside the cleanup.
// It's probably easier to just write the data into Firestore in the handleApproveReject methods and then we can create a little helper.
code = code.replace(
  "if (unsubWarningLetters) unsubWarningLetters();",
  "if (unsubWarningLetters) unsubWarningLetters();\n        if (unsubNotif) unsubNotif();"
);

const handleMarkNotifRead = `
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await setDoc(doc(db, 'notifications', id), { read: true }, { merge: true });
    } catch (e) {
      console.error('Error marking notification as read:', e);
    }
  };
`;
code = code.replace(
  "  const handleSaveAccounts = async (newAccounts: UserAccount[]) => {",
  handleMarkNotifRead + "\n  const handleSaveAccounts = async (newAccounts: UserAccount[]) => {"
);

// Add props to iOSGlassLayout
code = code.replace(
  "        cutiApprovers={generalSettings.cutiApprovers}",
  "        cutiApprovers={generalSettings.cutiApprovers}\n        notifications={notifications}\n        onMarkNotificationRead={handleMarkNotificationRead}"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx with notifications');
