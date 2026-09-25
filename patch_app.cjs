const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "leaveRequests={leaveRequests}\\n        exitPermissions={exitPermissions}",
  "leaveRequests={leaveRequests}\n        exitPermissions={exitPermissions}\n        izinKeluarApprovers={generalSettings.izinKeluarApprovers}\n        cutiApprovers={generalSettings.cutiApprovers}"
);

// wait the exact match is:
//         leaveRequests={leaveRequests}
//         exitPermissions={exitPermissions}
//       >

code = code.replace(
  /leaveRequests=\{leaveRequests\}\s*exitPermissions=\{exitPermissions\}/,
  "leaveRequests={leaveRequests}\n        exitPermissions={exitPermissions}\n        izinKeluarApprovers={generalSettings.izinKeluarApprovers}\n        cutiApprovers={generalSettings.cutiApprovers}"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx');
