const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const syncSettingsStr = `
        // Sync General Settings
        const unsubGeneral = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
          if (docSnap.exists()) {
            setGeneralSettings(docSnap.data() as GeneralSettings);
          }
        }, (err) => console.log('Settings read err'));
`;

const syncManhajStr = `
        // Sync Manhajiyyah Clauses
        let firstManhajLoad = true;
        unsubManhaj = onSnapshot(collection(db, 'manhajiyyahClauses'), (snap) => {
          if (!firstManhajLoad && !isAd) {
             snap.docChanges().forEach(change => {
               if (change.type === 'added' || change.type === 'modified') {
                 const newData = change.doc.data();
                 const msg = change.type === 'added' 
                   ? \`Pasal Manhajiyyah Baru Ditambahkan: \${newData.bab} - \${newData.title}\`
                   : \`Pasal Manhajiyyah Diperbarui: \${newData.title}\`;
                 
                 // Show Browser Notification if supported
                 if (Notification.permission === 'granted') {
                    new Notification('Pembaruan Manhajiyyah', { body: msg });
                 }
                 alert(msg); // Fallback in-app alert
               }
             });
          }
          setManhajiyyahClauses(snap.docs.map(d => d.data() as ManhajiyyahClause));
          firstManhajLoad = false;
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'manhajiyyahClauses'));
`;

// Remove these from inside the auth hook
let newContent = content.replace(syncSettingsStr, "");
newContent = newContent.replace(syncManhajStr, "");

// Add a new useEffect right before the FIREBASE SYNC HOOK
const globalSyncStr = `
  // GLOBAL PUBLIC SYNC HOOK (No Auth Required)
  useEffect(() => {
    // Sync General Settings
    const unsubGeneral = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setGeneralSettings(docSnap.data() as GeneralSettings);
      }
    }, (err) => console.log('Settings read err'));

    // Sync Manhajiyyah Clauses
    let firstManhajLoad = true;
    const unsubManhaj = onSnapshot(collection(db, 'manhajiyyahClauses'), (snap) => {
      if (!firstManhajLoad && currentUser?.role !== 'Admin') {
         snap.docChanges().forEach(change => {
           if (change.type === 'added' || change.type === 'modified') {
             const newData = change.doc.data();
             const msg = change.type === 'added' 
               ? \`Pasal Manhajiyyah Baru Ditambahkan: \${newData.bab} - \${newData.title}\`
               : \`Pasal Manhajiyyah Diperbarui: \${newData.title}\`;
             
             if (Notification.permission === 'granted') {
                new Notification('Pembaruan Manhajiyyah', { body: msg });
             }
             alert(msg);
           }
         });
      }
      setManhajiyyahClauses(snap.docs.map(d => d.data() as ManhajiyyahClause));
      firstManhajLoad = false;
    }, (err) => console.log('Manhajiyyah read err'));

    return () => {
      unsubGeneral();
      unsubManhaj();
    };
  }, [currentUser?.role]); // re-bind when role changes so the notification logic uses correct role

  // FIREBASE SYNC HOOK
`;

newContent = newContent.replace("  // FIREBASE SYNC HOOK\n  useEffect(() => {", globalSyncStr + "  useEffect(() => {");

fs.writeFileSync('src/App.tsx', newContent);
