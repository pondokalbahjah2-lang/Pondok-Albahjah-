const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
    'locationSettings={locationSettings}',
    'locationSettings={locationSettings || INITIAL_LOCATION_SETTINGS}'
);
fs.writeFileSync('src/App.tsx', code);
console.log('Patched Kajian locationSettings fallback');
