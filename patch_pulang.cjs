const fs = require('fs');

let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

const targetStr = `      const jamPulang = userSchedule?.customJamKerja?.[currDay]?.pulang || userSchedule?.jamPulang || "16:00";
      
      const [currH, currM] = timeStr.replace('.', ':').split(':').map(Number);
      const [schPulangH, schPulangM] = jamPulang.split(':').map(Number);
      let pulangNotes = todayRecord!.notes;
      
      const diffPulangMins = (schPulangH * 60 + schPulangM) - (currH * 60 + currM);`;

const newStr = `      const jamPulang = userSchedule?.customJamKerja?.[currDay]?.pulang || userSchedule?.jamPulang || "16:00";
      const jamMasuk = userSchedule?.customJamKerja?.[currDay]?.masuk || userSchedule?.jamMasuk || "08:00";
      
      const [currH, currM] = timeStr.replace('.', ':').split(':').map(Number);
      const [schPulangH, schPulangM] = jamPulang.split(':').map(Number);
      const [schMasukH] = jamMasuk.split(':').map(Number);
      
      let pulangNotes = todayRecord!.notes;
      
      const isNightShift = schPulangH < schMasukH;
      const effectiveSchPulangH = isNightShift ? schPulangH + 24 : schPulangH;
      const effectiveCurrH = (isNightShift && currH < schMasukH) ? currH + 24 : currH;
      
      const diffPulangMins = (effectiveSchPulangH * 60 + schPulangM) - (effectiveCurrH * 60 + currM);`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/components/AbsensiView.tsx', content);
console.log('patched diffPulangMins');
