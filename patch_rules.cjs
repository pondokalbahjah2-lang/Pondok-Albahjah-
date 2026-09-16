const fs = require('fs');

let rules = fs.readFileSync('firestore.rules', 'utf8');

const kajianRule = `
    // kajian collection
    match /kajian/{docId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isAdmin();
    }
`;

rules = rules.replace('    // fcmTokens collection', kajianRule + '    // fcmTokens collection');
if (!rules.includes('/kajian/')) {
    rules = rules.replace('    match /fcmTokens/{docId} {', kajianRule + '    match /fcmTokens/{docId} {');
}

fs.writeFileSync('firestore.rules', rules);
console.log('Patched firestore.rules for kajian');
