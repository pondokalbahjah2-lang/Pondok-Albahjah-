const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `        if (currentUser?.role === 'Admin') {
      try {
        for (const a of addedOrUpdated) await setDoc(doc(db, 'users', a.id), a);
        for (const a of deleted) {
           await deleteDoc(doc(db, 'users', a.id));
        }
        if (addedOrUpdated.length > 0 || deleted.length > 0) {
          logAudit('DATA_CHANGE', \`Admin updated accounts: \${addedOrUpdated.map(u => u.name).join(', ')} | Deleted: \${deleted.map(u => u.name).join(', ')}\`, currentUser);
        }
      } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'users'); }
    }`;

const newLogic = `    try {
      for (const a of addedOrUpdated) {
        if (currentUser?.role === 'Admin' || currentUser?.id === a.id) {
          await setDoc(doc(db, 'users', a.id), a);
        }
      }
      if (currentUser?.role === 'Admin') {
        for (const a of deleted) {
           await deleteDoc(doc(db, 'users', a.id));
        }
        if (addedOrUpdated.length > 0 || deleted.length > 0) {
          logAudit('DATA_CHANGE', \`Admin updated accounts: \${addedOrUpdated.map(u => u.name).join(', ')} | Deleted: \${deleted.map(u => u.name).join(', ')}\`, currentUser);
        }
      }
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'users'); }`;

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx handleSaveAccounts patched successfully.');
} else {
  console.log('oldLogic not found in App.tsx');
}
