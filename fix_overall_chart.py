import re

with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

old_loop_logic = """      accounts.filter(a => a.role === 'Pejuang').forEach(p => {
        const isCuti = leaveRequests.some(l => l.pejuangId === p.id && l.status === 'Disetujui' && l.tanggalMulai <= dateStr && l.tanggalSelesai >= dateStr);
        const isIzin = exitPermissions.some(e => e.pejuangId === p.id && e.status === 'Disetujui' && e.tanggalKeluar <= dateStr && e.tanggalIzinSampai >= dateStr);
        const att = attendance.find(a => a.pejuangId === p.id && a.date === dateStr);
        
        if (isCuti) cuti++;
        else if (att?.status === 'Sakit') sakit++;
        else if (att?.status === 'Izin') izinTdkMasuk++;
        else if (att?.status === 'Libur') libur++;
        else if (isIzin) izinKeluar++;
        else if (att) {
          if (att.status === 'Hadir') hadir++;
          else if (att.status === 'Terlambat') telat++;
        }
      });"""

new_loop_logic = """      const hariMap = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const [year, month, day] = dateStr.split('-');
      const dayOfWeek = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getDay();
      const namaHari = hariMap[dayOfWeek];

      accounts.filter(a => a.role === 'Pejuang').forEach(p => {
        const userSchedule = (schedules || []).find((s: any) => s.targetId === p.id || s.targetId === p.subDivisi || (s.targetType === 'Group' && (s.pejuangIds?.includes(p.id) || s.divisiIds?.includes(p.subDivisi))));
        const hariKerja = userSchedule?.hariKerja || ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const isCuti = leaveRequests.some(l => l.pejuangId === p.id && l.status === 'Disetujui' && l.tanggalMulai <= dateStr && l.tanggalSelesai >= dateStr);
        const isIzin = exitPermissions.some(e => e.pejuangId === p.id && e.status === 'Disetujui' && e.tanggalKeluar <= dateStr && e.tanggalIzinSampai >= dateStr);
        const att = attendance.find(a => a.pejuangId === p.id && a.date === dateStr);
        
        if (isCuti) cuti++;
        else if (att?.status === 'Sakit') sakit++;
        else if (att?.status === 'Izin') izinTdkMasuk++;
        else if (att?.status === 'Libur' || !hariKerja.includes(namaHari) || (userSchedule?.tanggalLibur && userSchedule.tanggalLibur.includes(dateStr))) libur++;
        else if (isIzin) izinKeluar++;
        else if (att) {
          if (att.status === 'Hadir') hadir++;
          else if (att.status === 'Terlambat') telat++;
        }
      });"""

content = content.replace(old_loop_logic, new_loop_logic)

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
