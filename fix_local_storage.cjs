const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const hasSeen = AppStorage.getItem(`onboarding_seen_${user.id}`);",
  "const hasSeen = localStorage.getItem(`onboarding_seen_${user.id}`);"
);

code = code.replace(
  "AppStorage.setItem(`onboarding_seen_${currentUser.id}`, 'true');",
  "localStorage.setItem(`onboarding_seen_${currentUser.id}`, 'true');"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed localStorage references');
