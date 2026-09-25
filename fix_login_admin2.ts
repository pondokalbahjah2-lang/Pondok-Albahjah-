import fs from 'fs';

let content = fs.readFileSync('src/components/LoginView.tsx', 'utf-8');

content = content.replace(/const \{ createUserWithEmailAndPassword \} = require\('firebase\/auth'\);\n/, '');
content = content.replace(/const \{ doc, setDoc \} = require\('firebase\/firestore'\);\n/, '');

fs.writeFileSync('src/components/LoginView.tsx', content, 'utf-8');
console.log('Removed requires');
