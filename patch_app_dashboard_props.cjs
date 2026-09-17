const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "                leaveRequests={leaveRequests}\n                warningLetters={warningLetters}\n                manhajiyyahClauses={manhajiyyahClauses}\n                broadcastMessage={generalSettings.broadcastMessage}\n                onNavigate={setActiveTab}\n              />",
  "                leaveRequests={leaveRequests}\n                warningLetters={warningLetters}\n                manhajiyyahClauses={manhajiyyahClauses}\n                broadcastMessage={generalSettings.broadcastMessage}\n                onNavigate={setActiveTab}\n                izinKeluarApprovers={generalSettings.izinKeluarApprovers}\n                cutiApprovers={generalSettings.cutiApprovers}\n              />"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx dashboard props');
