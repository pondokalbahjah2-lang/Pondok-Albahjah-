const fs = require('fs');
let code = fs.readFileSync('src/components/KalenderView.tsx', 'utf8');
code = code.replace(
  /year: 'numeric',\n                  }\)/,
  "year: 'numeric',\n                  }).replace('Minggu', 'Ahad')"
);
fs.writeFileSync('src/components/KalenderView.tsx', code);
