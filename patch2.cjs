const fs = require('fs');
let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

const targetNewRecord = `      isWithinRadius: isWithinRadius,
      notes: notes || \`Absensi melalui sistem web app (\${isWithinRadius ? 'Dalam Radius' : 'Luar Radius'})\`,
    };`;

const newRecordReplacement = `      isWithinRadius: isWithinRadius,
      notes: notes || \`Absensi melalui sistem web app (\${isWithinRadius ? 'Dalam Radius' : 'Luar Radius'})\`,
      suratSakitUrl: attendanceStatus === 'Sakit' && suratSakitUrl ? suratSakitUrl : undefined,
    };`;

code = code.replace(targetNewRecord, newRecordReplacement);
fs.writeFileSync('src/components/AbsensiView.tsx', code);
console.log('patched newRecord');
