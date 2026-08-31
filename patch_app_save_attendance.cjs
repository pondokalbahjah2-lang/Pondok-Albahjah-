const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `    try {
      for (const a of addedOrUpdated) await setDoc(doc(db, 'attendance', a.id), a);
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'attendance'); }`,
  `    try {
      for (const a of addedOrUpdated) await setDoc(doc(db, 'attendance', a.id), a);
    } catch (e) { 
      handleFirestoreError(e, OperationType.WRITE, 'attendance'); 
      throw e;
    }`
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx handleSaveAttendance');
