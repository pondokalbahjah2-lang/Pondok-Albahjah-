const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes("collection(db, 'auditLogs')")) {
  console.log("No audit logs collection found.");
} else {
    // We already have a query for auditLogs around line 791, but we need a listener.
    // Let's add it to the sync flow where we do `onSnapshot`
    if (!content.includes('setAuditLogs(snapshot.docs.map(doc =>')) {
        const marker = "const unsubscribeManhajiyyah = onSnapshot(";
        const replacement = `
      const unsubscribeAuditLogs = onSnapshot(collection(db, 'auditLogs'), (snapshot) => {
        setAuditLogs(snapshot.docs.map(doc => doc.data() as AuditLogEntry));
      }, (error) => {
        handleFirestoreError(error, OperationType.READ, 'auditLogs');
      });

      const unsubscribeManhajiyyah = onSnapshot(`;
        
        content = content.replace(marker, replacement);
        
        const returnMarker = "unsubscribeManhajiyyah();";
        const returnReplacement = "unsubscribeAuditLogs();\n        unsubscribeManhajiyyah();";
        
        content = content.replace(returnMarker, returnReplacement);
        
        fs.writeFileSync('src/App.tsx', content);
        console.log("Listener injected");
    }
}
