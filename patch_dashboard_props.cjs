const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  "  manhajiyyahClauses: ManhajiyyahClause[];",
  "  manhajiyyahClauses: ManhajiyyahClause[];\n  izinKeluarApprovers?: string[];\n  cutiApprovers?: string[];"
);

code = code.replace(
  "  broadcastMessage,\n  onNavigate,\n}) => {",
  "  broadcastMessage,\n  onNavigate,\n  izinKeluarApprovers = [],\n  cutiApprovers = [],\n}) => {"
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('Patched dashboard props');
