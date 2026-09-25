const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Change initialization to read from AppStorage for Kajian if it doesn't already
if (code.includes('const [kajianRecords, setKajianRecords] = useState<KajianRecord[]>([]);')) {
  code = code.replace(
    'const [kajianRecords, setKajianRecords] = useState<KajianRecord[]>([]);', 
    'const [kajianRecords, setKajianRecords] = useState<KajianRecord[]>(AppStorage.getKajianRecords());'
  );
  
  // Also add a migration block when authenticated
  const migrationCode = `
        // Migrate local kajian records to Firestore
        const localKajian = AppStorage.getKajianRecords();
        if (localKajian.length > 0) {
           localKajian.forEach(async (record) => {
             try {
                await setDoc(doc(db, 'kajian', record.id), record, { merge: true });
             } catch(e) { console.error('Migration error:', e); }
           });
        }
`;
  code = code.replace(/(\/\/ Sync Kajian)/, migrationCode + '\n$1');
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patched App.tsx for local migration');
} else {
  console.log('Already patched or not found');
}
