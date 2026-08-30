const fs = require('fs');
let code = fs.readFileSync('src/data/mockData.ts', 'utf8');

code = code.replace(/latitude: -6\.7321,/, 'latitude: -6.7643194,');
code = code.replace(/longitude: 108\.5521,/, 'longitude: 108.4879201,');
code = code.replace(/radiusMaxMeters: 150,/, 'radiusMaxMeters: 200,');

fs.writeFileSync('src/data/mockData.ts', code);
console.log('mockData.ts location patched');
