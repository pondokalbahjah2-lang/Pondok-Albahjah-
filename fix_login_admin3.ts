import fs from 'fs';

let content = fs.readFileSync('src/components/LoginView.tsx', 'utf-8');

content = content.replace(
  /if \(email\.includes\('admin'\) \|\| email\.includes\('abdusalam'\) \|\| email\.includes\('salamabdu'\)\) \{/,
  "if (email.includes('admin') || email.includes('abdusalam') || email.includes('salamabdu') || email.includes('pondokalbahjah2')) {"
);

fs.writeFileSync('src/components/LoginView.tsx', content, 'utf-8');
console.log('Fixed early catch');
