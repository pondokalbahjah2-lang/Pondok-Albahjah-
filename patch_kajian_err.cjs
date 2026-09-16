const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = `        unsubKajian = onSnapshot(kajianQ, (snap) => {
          let data = snap.docs.map(d => d.data() as KajianRecord);
          data = data.sort((a, b) => {
            const dateDiff = new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
            if (dateDiff !== 0) return dateDiff;
            return (b.id || '').localeCompare(a.id || '');
          });
          setKajianRecords(data);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'kajian'));`;

const newCode = `        unsubKajian = onSnapshot(kajianQ, (snap) => {
          let data = snap.docs.map(d => d.data() as KajianRecord);
          data = data.sort((a, b) => {
            const dateDiff = new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
            if (dateDiff !== 0) return dateDiff;
            return (b.id || '').localeCompare(a.id || '');
          });
          setKajianRecords(data);
        }, (err) => {
          console.error('[DIAGNOSTIC] Kajian onSnapshot Error:', err);
          if (err.code === 'permission-denied') {
            console.error('[DIAGNOSTIC] Permission denied reading Kajian. User:', uid, 'Role:', currentUser?.role);
          }
          handleFirestoreError(err, OperationType.LIST, 'kajian');
        });`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/App.tsx', code);
console.log('Patched onSnapshot error logging in App.tsx');
