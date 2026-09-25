const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importRegex = /import \{ getDailyClauseIndex \} from '.\/utils\/hijriCalendar';/;
if (code.match(importRegex)) {
  code = code.replace(importRegex, `import { getDailyClauseIndex } from './utils/hijriCalendar';\nimport { usePulangReminder } from './hooks/usePulangReminder';`);
}

const hookAnchor = `  useNotificationListener(currentUser);`;
if (code.includes(hookAnchor)) {
  code = code.replace(hookAnchor, `${hookAnchor}\n  usePulangReminder(currentUser, schedules, attendance);`);
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched with usePulangReminder.');
