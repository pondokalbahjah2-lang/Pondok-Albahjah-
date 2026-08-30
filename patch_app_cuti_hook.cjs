const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importAnchor = `import { usePulangReminder } from './hooks/usePulangReminder';`;
code = code.replace(
  importAnchor, 
  `${importAnchor}\nimport { useCutiReminder } from './hooks/useCutiReminder';`
);

const hookAnchor = `  usePulangReminder(currentUser, schedules, attendance);`;
code = code.replace(
  hookAnchor, 
  `${hookAnchor}\n  useCutiReminder(currentUser, leaveRequests, generalSettings.jenisCutiList);`
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched with useCutiReminder');
