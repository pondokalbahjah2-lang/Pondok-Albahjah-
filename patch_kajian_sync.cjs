const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add unsubKajian
content = content.replace(/let unsubCutiNotif = \(\) => \{\};/, `let unsubKajian = () => {};\n    let unsubCutiNotif = () => {};`);

// 2. Add unsubKajian cleanup
content = content.replace(/unsubUsers\(\); unsubAtt\(\); unsubExit\(\); unsubLeave\(\); unsubWarn\(\); unsubSlip\(\);/g, `unsubUsers(); unsubAtt(); unsubExit(); unsubLeave(); unsubWarn(); unsubSlip(); unsubKajian();`);

// 3. Add Kajian Sync Logic
const kajianSyncStr = `
        // Sync Kajian
        const kajianQ = isAd 
          ? query(collection(db, 'kajian'), orderBy('id', 'desc'), limit(3000))
          : query(collection(db, 'kajian'), where('pejuangId', '==', uid));
        unsubKajian = onSnapshot(kajianQ, (snap) => {
          let data = snap.docs.map(d => d.data() as KajianRecord);
          if (!isAd) {
            data = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          }
          setKajianRecords(data);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'kajian'));
`;

// Insert after exitPermissions sync
content = content.replace(/(\/\/ Sync Exit Permissions[\s\S]*?}, \(err\) => handleFirestoreError\(err, OperationType\.LIST, 'exitPermissions'\)\);)/, `$1\n${kajianSyncStr}`);

// 4. Update handleSaveKajian
const handleSaveKajianOld = `  const handleSaveKajian = (newRecords: KajianRecord[]) => {
    setKajianRecords(newRecords);
    AppStorage.saveKajianRecords(newRecords);
  };`;

const handleSaveKajianNew = `  const handleSaveKajian = async (newRecords: KajianRecord[]) => {
    setKajianRecords(newRecords);
    AppStorage.saveKajianRecords(newRecords);
    
    try {
      const addedOrUpdated = newRecords.filter(a => {
        const existing = kajianRecords.find(ex => ex.id === a.id);
        return !existing || JSON.stringify(existing) !== JSON.stringify(a);
      });
      const deleted = kajianRecords.filter(a => !newRecords.find(ac => ac.id === a.id));
      for (const a of addedOrUpdated) await setDoc(doc(db, 'kajian', a.id), a);
      for (const a of deleted) await deleteDoc(doc(db, 'kajian', a.id));
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'kajian'); }
  };`;

content = content.replace(handleSaveKajianOld, handleSaveKajianNew);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx for Kajian Sync');
