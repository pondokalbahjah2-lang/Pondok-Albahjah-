import re
with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

# Replace handleExportCSV with handleExportExcel
old_csv = """  const handleExportCSV = () => {
    const csvRows = [
      ['LAPORAN INDIVIDU PEJUANG AL-BAHJAH CIREBON 1'],
      ['Nama Pejuang', activePejuang.name],
      ['Sub Divisi', activePejuang.subDivisi],
      ['Amanah', activePejuang.amanah],
      ['Email', activePejuang.email || '-'],
      [''],
      ['RINGKASAN REKAPITULASI'],
      ['Total Absensi Hadir Tepat Waktu', totalHadir],
      ['Total Absensi Terlambat', totalTerlambat],
      ['Total Sakit', totalSakit],
      ['Total Permohonan Izin Keluar', userExits.length],
      ['Total Pengajuan Cuti', userLeaves.length],
      ['Total Surat Teguran & SP', userWarnings.length],
      [''],
      ['DETAIL IZIN KELUAR'],
      ['Tanggal Keluar', 'Tanggal Kembali', 'Alasan', 'Jam Harus Kembali', 'Jam Real', 'Status', 'Keterangan Terlambat'],
      ...userExits.map((e) => [
        e.tanggalKeluar,
        e.tanggalIzinSampai,
        e.alasanIzin,
        e.jamIzinSampai,
        e.jamKembali || '-',
        e.status,
        e.keteranganTerlambat || '-'
      ]),
      [''],
      ['DETAIL CUTI'],
      ['Tanggal Mulai', 'Tanggal Selesai', 'Alasan', 'Status'],
      ...userLeaves.map((c) => [
        c.tanggalMulai,
        c.tanggalSelesai,
        c.alasanCuti,
        c.status
      ]),
      [''],
      ['DETAIL SURAT TEGURAN / SP'],
      ['Tanggal', 'Jenis', 'Deskripsi'],
      ...userWarnings.map((w) => [
        w.date,
        w.type,
        w.description
      ])
    ];

    const csvContent = csvRows.map(e => e.map(item => `"${item}"`).join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `Laporan_Individu_${activePejuang.name.replace(/\\s+/g, '_')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };"""

new_excel = """  const handleExportCSV = () => {
    // Actually exporting to Excel now
    const wsData = [
      ['LAPORAN INDIVIDU PEJUANG AL-BAHJAH CIREBON 1'],
      ['Nama Pejuang', activePejuang.name],
      ['Sub Divisi', activePejuang.subDivisi],
      ['Amanah', activePejuang.amanah],
      ['Email', activePejuang.email || '-'],
      [''],
      ['RINGKASAN REKAPITULASI'],
      ['Total Absensi Hadir Tepat Waktu', totalHadir],
      ['Total Absensi Terlambat', totalTerlambat],
      ['Total Sakit', totalSakit],
      ['Total Izin Tidak Masuk', userAtt.filter((a) => a.status === 'Izin tidak masuk').length],
      ['Total Permohonan Izin Keluar', userExits.length],
      ['Total Pengajuan Cuti', userLeaves.length],
      ['Total Surat Teguran & SP', userWarnings.length],
      [''],
      ['DETAIL IZIN KELUAR'],
      ['Tanggal Keluar', 'Tanggal Kembali', 'Alasan', 'Jam Harus Kembali', 'Jam Real', 'Status', 'Keterangan Terlambat'],
      ...userExits.map((e) => [
        e.tanggalKeluar,
        e.tanggalIzinSampai,
        e.alasanIzin,
        e.jamIzinSampai,
        e.jamKembali || '-',
        e.status,
        e.keteranganTerlambat || '-'
      ]),
      [''],
      ['DETAIL CUTI'],
      ['Tanggal Mulai', 'Tanggal Selesai', 'Alasan', 'Status'],
      ...userLeaves.map((c) => [
        c.tanggalMulai,
        c.tanggalSelesai,
        c.alasanCuti,
        c.status
      ]),
      [''],
      ['DETAIL SURAT TEGURAN / SP'],
      ['Tanggal', 'Jenis', 'Deskripsi'],
      ...userWarnings.map((w) => [
        w.date,
        w.type,
        w.description
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Individu");
    XLSX.writeFile(wb, `Laporan_Individu_${activePejuang.name.replace(/\s+/g, '_')}.xlsx`);
  };"""

content = content.replace(old_csv, new_excel)
content = content.replace("<span>Unduh CSV</span>", "<span>Unduh Excel</span>")

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
