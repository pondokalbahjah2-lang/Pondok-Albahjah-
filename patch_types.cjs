const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "  approvedAt?: string;",
  "  approvedAt?: string;\n  history?: { status: string, by: string, timestamp: string }[];"
);

// Do it again for the second occurrence
code = code.replace(
  "  approvedAt?: string;",
  "  approvedAt?: string;\n  history?: { status: string, by: string, timestamp: string }[];"
);

code = code.replace(
  "export interface AppNotification {",
  "export interface AppNotification {\n  userId?: string;"
);

fs.writeFileSync('src/types.ts', code);
console.log('Patched types');
