const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const percentageStr = `  const monthlyKehadiranPercentage = React.useMemo(() => {
    const data = [];
    const today = new Date();
    const activePejuangs = accounts.filter(a => a.role === 'Pejuang').length;
    if (activePejuangs === 0) return []; // avoid division by zero

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      
      const dayRecords = attendance.filter(a => a.date === dateStr && (a.status === 'Hadir' || a.status === 'Terlambat'));
      // Using unique pejuang count who attended that day
      const uniqueAttendees = new Set(dayRecords.map(a => a.pejuangId)).size;
      const percentage = Math.round((uniqueAttendees / activePejuangs) * 100);
      
      data.push({
        name: dayName,
        persentase: percentage,
      });
    }
    return data;
  }, [attendance, accounts]);`;

const newPercentageStr = `  const monthlyKehadiranPercentage = React.useMemo(() => {
    const data = [];
    const today = new Date();
    const activePejuangs = accounts.filter(a => a.role === 'Pejuang').length;
    const denominator = activePejuangs > 0 ? activePejuangs : (accounts.length || 1);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      
      const dayRecords = attendance.filter(a => a.date === dateStr);
      
      const presentRecords = dayRecords.filter(a => a.status === 'Hadir' || a.status === 'Terlambat');
      const uniqueAttendees = new Set(presentRecords.map(a => a.pejuangId)).size;
      
      const excusedRecords = dayRecords.filter(a => a.status === 'Sakit' || a.status === 'Izin' || a.status === 'Izin Tidak Masuk' || a.status === 'Libur');
      const uniqueExcused = new Set(excusedRecords.map(a => a.pejuangId)).size;
      
      const expectedToAttend = denominator - uniqueExcused;
      const finalDenominator = expectedToAttend > 0 ? expectedToAttend : denominator;
      
      let percentage = 0;
      if (uniqueAttendees > 0) {
          percentage = Math.round((uniqueAttendees / finalDenominator) * 100);
          if (percentage > 100) percentage = 100;
      }
      
      data.push({
        name: dayName,
        persentase: percentage,
      });
    }
    return data;
  }, [attendance, accounts]);`;

content = content.replace(percentageStr, newPercentageStr);

// Also let's fix Izin Tidak Masuk in the other chart colors
content = content.replace(
  "else if (record.status === 'Izin') { statusVal = 1; fill = '#8b5cf6'; } ",
  "else if (record.status === 'Izin' || record.status === 'Izin Tidak Masuk') { statusVal = 1; fill = '#8b5cf6'; } "
);
content = content.replace(
  "else if (record.status === 'Izin') { statusVal = 1; fill = '#8b5cf6'; } // blue",
  "else if (record.status === 'Izin' || record.status === 'Izin Tidak Masuk') { statusVal = 1; fill = '#8b5cf6'; } // blue"
);
content = content.replace(
  "else if (a.status === 'Izin') izin++;",
  "else if (a.status === 'Izin' || a.status === 'Izin Tidak Masuk') izin++;"
);

fs.writeFileSync('src/components/DashboardView.tsx', content);
