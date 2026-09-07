with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

chart_old = """    let hadir = 0, telat = 0, sakit = 0, cuti = 0, libur = 0, izin = 0;
    
    // Iterate through dates in the range
    const start = new Date(reportStartDate);
    const end = new Date(reportEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = getLocalDateString(d);
      
      accounts.filter(a => a.role === 'Pejuang').forEach(p => {
        const isCuti = leaveRequests.some(l => l.pejuangId === p.id && l.status === 'Disetujui' && l.tanggalMulai <= dateStr && l.tanggalSelesai >= dateStr);
        const isIzin = exitPermissions.some(e => e.pejuangId === p.id && e.status === 'Disetujui' && e.tanggalKeluar <= dateStr && e.tanggalIzinSampai >= dateStr);
        const att = attendance.find(a => a.pejuangId === p.id && a.date === dateStr);
        
        if (isCuti) cuti++;
        else if (att?.status === 'Sakit') sakit++;
        else if (att?.status === 'Izin tidak masuk') izin++;
        else if (att?.status === 'Libur') libur++;
        else if (isIzin) izin++;
        else if (att) {
          if (att.status === 'Hadir') hadir++;
          else if (att.status === 'Terlambat') telat++;
        }
      });
    }

    return [
      { name: 'Hadir', Total: hadir, fill: '#10b981' },
      { name: 'Telat', Total: telat, fill: '#f59e0b' },
      { name: 'Sakit', Total: sakit, fill: '#f43f5e' },
      { name: 'Cuti', Total: cuti, fill: '#6366f1' },
      { name: 'Izin', Total: izin, fill: '#0ea5e9' },
      { name: 'Libur', Total: libur, fill: '#a855f7' }
    ];"""

chart_new = """    let hadir = 0, telat = 0, sakit = 0, cuti = 0, libur = 0, izinKeluar = 0, izinTdkMasuk = 0;
    
    // Iterate through dates in the range
    const start = new Date(reportStartDate);
    const end = new Date(reportEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = getLocalDateString(d);
      
      accounts.filter(a => a.role === 'Pejuang').forEach(p => {
        const isCuti = leaveRequests.some(l => l.pejuangId === p.id && l.status === 'Disetujui' && l.tanggalMulai <= dateStr && l.tanggalSelesai >= dateStr);
        const isIzin = exitPermissions.some(e => e.pejuangId === p.id && e.status === 'Disetujui' && e.tanggalKeluar <= dateStr && e.tanggalIzinSampai >= dateStr);
        const att = attendance.find(a => a.pejuangId === p.id && a.date === dateStr);
        
        if (isCuti) cuti++;
        else if (att?.status === 'Sakit') sakit++;
        else if (att?.status === 'Izin tidak masuk') izinTdkMasuk++;
        else if (att?.status === 'Libur') libur++;
        else if (isIzin) izinKeluar++;
        else if (att) {
          if (att.status === 'Hadir') hadir++;
          else if (att.status === 'Terlambat') telat++;
        }
      });
    }

    return [
      { name: 'Hadir', Total: hadir, fill: '#10b981' },
      { name: 'Telat', Total: telat, fill: '#f59e0b' },
      { name: 'Sakit', Total: sakit, fill: '#f43f5e' },
      { name: 'Cuti', Total: cuti, fill: '#6366f1' },
      { name: 'Izin Keluar', Total: izinKeluar, fill: '#0ea5e9' },
      { name: 'Izin Tdk Masuk', Total: izinTdkMasuk, fill: '#3b82f6' },
      { name: 'Libur', Total: libur, fill: '#a855f7' }
    ];"""

content = content.replace(chart_old, chart_new)
with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
