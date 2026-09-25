const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const syncCode = `
        // Sync Notifications
        const notifQuery = query(collection(db, 'notifications'), where('userId', '==', uid));
        unsubNotif = onSnapshot(notifQuery, (snapshot) => {
          const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setNotifications(notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        });
`;

code = code.replace(
  "        // Sync Users",
  syncCode + "\n        // Sync Users"
);

code = code.replace(
  "let unsubUsers: () => void;",
  "let unsubUsers: () => void;\n    let unsubNotif: () => void;"
);

code = code.replace(
  "if (unsubUsers) unsubUsers();",
  "if (unsubUsers) unsubUsers();\n      if (unsubNotif) unsubNotif();"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx with notifications');
