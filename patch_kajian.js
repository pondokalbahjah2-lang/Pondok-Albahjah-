const fs = require('fs');
let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

// The line is: const hasCatatan = r.statusValidasi !== 'Ditolak' && !!r.notesPhotoUrl;
code = code.replace(
    /const hasCatatan = r\.statusValidasi !== 'Ditolak' && !!r\.notesPhotoUrl;/g,
    "const hasCatatan = r.statusValidasi === 'Valid' && !!r.notesPhotoUrl;"
);

fs.writeFileSync('src/components/KajianView.tsx', code);
console.log('Patched KajianView.tsx');
