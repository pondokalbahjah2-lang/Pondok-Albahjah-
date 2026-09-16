const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/isLoading={isLoadingData}\s*isLoading={isLoadingData}/g, 'isLoading={isLoadingData}');
code = code.replace(
  '<IOSGlassLayout',
  '<IOSGlassLayout appLogoUrl={generalSettings.appLogoUrl}'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed App.tsx');
