const fs = require('fs');
let cutiCode = fs.readFileSync('src/components/CutiView.tsx', 'utf8');

cutiCode = cutiCode.replace(
  "{req.status === 'Disetujui' && (currentUser.role === 'Admin' || req.pejuangId === currentUser.id) && (",
  "{req.status === 'Disetujui' && (currentUser.role === 'Admin' || cutiApprovers.includes(currentUser.id) || req.pejuangId === currentUser.id) && ("
);

fs.writeFileSync('src/components/CutiView.tsx', cutiCode);

let izinCode = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');

izinCode = izinCode.replace(
  "{rec.status === 'Di Luar' && (currentUser.role === 'Admin' || rec.pejuangId === currentUser.id) && (",
  "{rec.status === 'Di Luar' && (currentUser.role === 'Admin' || izinKeluarApprovers.includes(currentUser.id) || rec.pejuangId === currentUser.id) && ("
);

fs.writeFileSync('src/components/IzinKeluarView.tsx', izinCode);
console.log('Patched roles');
