const fs = require('fs');
let content = fs.readFileSync('src/components/LocationMap.tsx', 'utf8');

content = content.replace(
  'dark:bg-slate-700">',
  'dark:bg-slate-700`}>'
);

content = content.replace(
  'dark:border-slate-700 relative z-0">',
  'dark:border-slate-700 relative z-0`}>'
);

fs.writeFileSync('src/components/LocationMap.tsx', content);
