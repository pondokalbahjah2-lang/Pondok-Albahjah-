const fs = require('fs');
let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

code = code.replace(
  'type="submit"\n                  disabled={!attendanceStatus}',
  'type="submit"\n                  disabled={!attendanceStatus || isSubmitting}'
);

code = code.replace(
  "<span>{attendanceStatus === 'Pulang' ? 'Kirim Absen Pulang' : 'Kirim Absen Masuk (' + attendanceStatus + ')'}</span>",
  "<span>{isSubmitting ? 'Menyimpan...' : (attendanceStatus === 'Pulang' ? 'Kirim Absen Pulang' : 'Kirim Absen Masuk (' + attendanceStatus + ')')}</span>"
);

fs.writeFileSync('src/components/AbsensiView.tsx', code);
console.log('Fixed AbsensiView button');
