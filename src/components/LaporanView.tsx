import { getLocalDateString } from '../utils/dateUtils';
import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import {
  Download,
  FileSpreadsheet,
  Printer,
  Search,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  FileDown,
} from 'lucide-react';
import {
  UserAccount,
  AttendanceRecord,
  ExitPermissionRecord,
  LeaveRequestRecord,
  WarningLetterRecord,
  SlipUbarRecord,
} from '../types';


// Fix default icon issue with Leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LaporanViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  attendance: AttendanceRecord[];
  exitPermissions: ExitPermissionRecord[];
  leaveRequests: LeaveRequestRecord[];
  warningLetters: WarningLetterRecord[];
  slipUbarList: SlipUbarRecord[];
  schedules?: any[];
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  currentUser,
  accounts,
  attendance,
  exitPermissions,
  leaveRequests,
  warningLetters,
  slipUbarList,
  schedules,
}) => {
  const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedPejuangId, setSelectedPejuangId] = useState<string>(
    currentUser.role === 'Admin'
      ? accounts.find((a) => a.role === 'Pejuang')?.id || accounts[0].id
      : currentUser.id
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [divisiFilter, setDivisiFilter] = useState('Semua');

  const uniqueDivisions = Array.from(new Set(accounts.filter(a => a.subDivisi).map(a => a.subDivisi)));
  
  const overallChartData = React.useMemo(() => {
    let hadir = 0, telat = 0, sakit = 0, cuti = 0, libur = 0, izin = 0;
    
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
    ];
  }, [reportStartDate, reportEndDate, accounts, attendance, leaveRequests, exitPermissions]);

  const filteredAccountsForReport = accounts.filter(a => divisiFilter === 'Semua' || a.subDivisi === divisiFilter);
  const pejuangAccounts = accounts.filter((a) => {
    if (a.role !== 'Pejuang') return false;
    if (divisiFilter !== 'Semua' && a.subDivisi !== divisiFilter) return false;
    
    // Filter by name (searchQuery)
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by shift (shiftFilter uses schedule targetId)
    if (shiftFilter) {
      const userSchedule = (schedules || []).find(s => s.targetId === a.id || s.targetId === a.subDivisi);
      if (!userSchedule || userSchedule.id !== shiftFilter) {
        return false;
      }
    }

    return true;
  });

  const activePejuang =
    accounts.find((a) => a.id === selectedPejuangId) || currentUser;

  // Compute metrics for active pejuang
  const userAtt = attendance.filter((a) => a.pejuangId === activePejuang.id);
  const userExits = exitPermissions.filter(
    (e) => e.pejuangId === activePejuang.id
  );
  const userSlipUbars = slipUbarList.filter((u) => u.pejuangId === activePejuang.id);
  const userLeaves = leaveRequests.filter(
    (l) => l.pejuangId === activePejuang.id
  );
  const userWarnings = warningLetters.filter(
    (w) => w.pejuangId === activePejuang.id
  );
  const userSlips = slipUbarList.filter((s) => s.pejuangId === activePejuang.id);

  const totalHadir = userAtt.filter((a) => a.status === 'Hadir').length;
  const totalTerlambat = userAtt.filter((a) => a.status === 'Terlambat').length;
  const totalSakit = userAtt.filter((a) => a.status === 'Sakit').length;

  // Generate Last 7 Days Attendance Consistency Data
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = getLocalDateString(d);
    
    const dailyRecords = userAtt.filter(a => a.date === dateStr);
    
    let statusText = 'Tidak Ada';
    let consistencyScore = 0;
    let color = '#94a3b8'; 

    if (dailyRecords.length > 0) {
      if (dailyRecords.some(r => r.status === 'Hadir')) {
        statusText = 'Hadir';
        consistencyScore = 1;
        color = '#2563eb'; 
      } else if (dailyRecords.some(r => r.status === 'Terlambat')) {
        statusText = 'Terlambat';
        consistencyScore = 0.5;
        color = '#d97706'; 
      } else if (dailyRecords.some(r => r.status === 'Sakit' || r.status === 'Libur')) {
        statusText = dailyRecords[0].status;
        consistencyScore = 1;
        color = '#10b981'; 
      }
    }

    return {
      date: dateStr.slice(5),
      status: statusText,
      Konsistensi: consistencyScore,
      fill: color
    };
  });

  // Export to CSV
  const handleExportCSV = () => {
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
        `"${e.alasan}"`,
        e.jamHarusKembali,
        e.jamKembaliReal || '-',
        e.status,
        e.keteranganKeterlambatan || '-',
      ]),
      [''],
      ['DETAIL REKAP CUTI'],
      ['Tanggal Mulai', 'Tanggal Selesai', 'Total Hari', 'Alasan', 'Status'],
      ...userLeaves.map((l) => [
        l.tanggalMulai,
        l.tanggalSelesai,
        l.totalHari,
        `"${l.alasan}"`,
        l.status,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Pejuang_${activePejuang.name.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => { window.print(); };

  const getDatesInRange = (startDate: string, endDate: string) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    while (currentDate <= end) {
      dates.push(getLocalDateString(new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const handleExportAllExcel = () => {
    if (!reportStartDate || !reportEndDate) {
      alert("Pilih rentang tanggal terlebih dahulu");
      return;
    }
    
    if (new Date(reportStartDate) > new Date(reportEndDate)) {
      alert("Tanggal mulai tidak boleh melebihi tanggal akhir");
      return;
    }

    const dateRange = getDatesInRange(reportStartDate, reportEndDate);
    const todayDateStr = getLocalDateString(new Date());
    
    // Create base data for each user
    const reportDataMasuk: any[] = [];
    const reportDataPulang: any[] = [];

    // Use filteredAccountsForReport to apply Divisi filter
    filteredAccountsForReport.forEach((p, idx) => {
      // Find user schedule
      const userSchedule = (schedules || []).find((s: any) => s.targetId === p.id || s.targetId === p.subDivisi);
      const hariKerja = userSchedule?.hariKerja || ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const hariMap = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

      let totalHadir = 0;
      let totalTelat = 0;
      let totalIzin = 0; // using Exit Permissions or "Izin" status
      let totalCuti = 0;
      let totalSakit = 0;
      let totalLibur = 0;

      const rowMasuk: any = {
        'No': idx + 1,
        'Nama': p.name,
        'Peran': p.role,
        'Amanah': p.amanah,
      };
      
      const rowPulang: any = {
        'No': idx + 1,
        'Nama': p.name,
        'Peran': p.role,
        'Amanah': p.amanah,
      };

      dateRange.forEach((dateStr) => {
        const [year, month, day] = dateStr.split('-');
        const dayOfWeek = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getDay();
        const namaHari = hariMap[dayOfWeek];
        const dateHeader = `${day}/${month}`; // DD/MM format

        let valMasuk = '-';
        let valPulang = '-';

        // Check Leave (Cuti)
        const isCuti = leaveRequests.some(l => 
          l.pejuangId === p.id && 
          l.status === 'Disetujui' && 
          l.tanggalMulai <= dateStr && 
          l.tanggalSelesai >= dateStr
        );

        // Check Attendance
        const att = attendance.find(a => a.pejuangId === p.id && a.date === dateStr);

        // Check Izin Keluar (as Izin)
        const isIzin = exitPermissions.some(e =>
           e.pejuangId === p.id &&
           e.tanggalKeluar <= dateStr &&
           e.tanggalIzinSampai >= dateStr &&
           e.tanggalKeluar !== e.tanggalIzinSampai // Hanya catat jika izin berhari-hari
        );

        if (isCuti) {
          valMasuk = 'Cuti';
          valPulang = 'Cuti';
          totalCuti++;
        } else if (att?.status === 'Sakit') {
          valMasuk = 'Sakit';
          valPulang = 'Sakit';
          totalSakit++;
        } else if (att?.status === 'Libur' || !hariKerja.includes(namaHari)) {
          valMasuk = 'Libur';
          valPulang = 'Libur';
          totalLibur++;
        } else if (isIzin) {
           valMasuk = att?.time || 'Izin';
           valPulang = att?.timePulang || 'Izin';
           totalIzin++;
        } else if (att) {
          if (att.status === 'Hadir') {
            totalHadir++;
          } else if (att.status === 'Terlambat') {
            totalTelat++;
          }
          
          const isPastDay = dateStr < todayDateStr;
          valMasuk = att.time || '-';
          valPulang = att.timePulang ? att.timePulang : (isPastDay ? 'TIDAK ABSEN PULANG' : '-');

        }

        rowMasuk[dateHeader] = valMasuk;
        rowPulang[dateHeader] = valPulang;
      });

      const totals = {
        'Total Hadir': totalHadir,
        'Total Telat': totalTelat,
        'Total Izin': totalIzin,
        'Total Cuti': totalCuti,
        'Total Sakit': totalSakit,
        'Total Libur': totalLibur,
      };

      Object.assign(rowMasuk, totals);
      Object.assign(rowPulang, totals);

      reportDataMasuk.push(rowMasuk);
      reportDataPulang.push(rowPulang);
    });

    const worksheetMasuk = XLSX.utils.json_to_sheet(reportDataMasuk);
    const worksheetPulang = XLSX.utils.json_to_sheet(reportDataPulang);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheetMasuk, "Absen Masuk");
    XLSX.utils.book_append_sheet(workbook, worksheetPulang, "Absen Pulang");
    
    XLSX.writeFile(workbook, `Laporan_Keseluruhan_Pejuang_${reportStartDate}_sd_${reportEndDate}.xlsx`);
  };

  const handleExportAllPDF = () => {
    if (!reportStartDate || !reportEndDate) {
      alert("Pilih rentang tanggal terlebih dahulu");
      return;
    }
    if (new Date(reportStartDate) > new Date(reportEndDate)) {
      alert("Tanggal mulai tidak boleh melebihi tanggal akhir");
      return;
    }

    const dateRange = getDatesInRange(reportStartDate, reportEndDate);
    const todayDateStr = getLocalDateString(new Date());
    if (dateRange.length > 31) {
       if (!confirm("Rentang waktu lebih dari 31 hari. Tabel PDF mungkin akan terlihat sangat sempit. Lanjutkan?")) return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');
    doc.setFontSize(12);
    doc.text(`Laporan Rekapitulasi Kehadiran (${reportStartDate} s/d ${reportEndDate})`, 14, 15);

    // Generate headers
    const headRow = ['No', 'Nama', 'Amanah'];
    dateRange.forEach(dateStr => {
       const [_, month, day] = dateStr.split('-');
       headRow.push(`${day}/${month}`);
    });
    headRow.push('H', 'T', 'I', 'C', 'S', 'L'); // Abbreviations for Totals to save space

    const bodyMasuk: any[] = [];
    const bodyPulang: any[] = [];

    filteredAccountsForReport.forEach((p, idx) => {
      const userSchedule = (schedules || []).find((s: any) => s.targetId === p.id || s.targetId === p.subDivisi);
      const hariKerja = userSchedule?.hariKerja || ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const hariMap = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

      let totalHadir = 0, totalTelat = 0, totalIzin = 0, totalCuti = 0, totalSakit = 0, totalLibur = 0;

      const rowM: any[] = [idx + 1, p.name, p.amanah];
      const rowP: any[] = [idx + 1, p.name, p.amanah];

      dateRange.forEach((dateStr) => {
        const [year, month, day] = dateStr.split('-');
        const dayOfWeek = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getDay();
        const namaHari = hariMap[dayOfWeek];

        let valM = '-';
        let valP = '-';

        const isCuti = leaveRequests.some(l => l.pejuangId === p.id && l.status === 'Disetujui' && l.tanggalMulai <= dateStr && l.tanggalSelesai >= dateStr);
        const isIzin = exitPermissions.some(e => e.pejuangId === p.id && e.tanggalKeluar <= dateStr && e.tanggalIzinSampai >= dateStr && e.tanggalKeluar !== e.tanggalIzinSampai);
        const att = attendance.find(a => a.pejuangId === p.id && a.date === dateStr);

        if (isCuti) {
          valM = 'C'; valP = 'C'; totalCuti++;
        } else if (att?.status === 'Sakit') {
          valM = 'S'; valP = 'S'; totalSakit++;
        } else if (att?.status === 'Libur' || !hariKerja.includes(namaHari)) {
          valM = 'L'; valP = 'L'; totalLibur++;
        } else if (isIzin) {
          valM = att?.time || 'I'; valP = att?.timePulang || 'I'; totalIzin++;
        } else if (att) {
          if (att.status === 'Hadir') totalHadir++;
          else if (att.status === 'Terlambat') totalTelat++;
          
          const isPastDay = dateStr < todayDateStr;
          valM = att.time || '-'; 
          valP = att.timePulang ? att.timePulang : (isPastDay ? 'TDK ABSEN PLG' : '-');

        }

        rowM.push(valM);
        rowP.push(valP);
      });

      rowM.push(totalHadir, totalTelat, totalIzin, totalCuti, totalSakit, totalLibur);
      rowP.push(totalHadir, totalTelat, totalIzin, totalCuti, totalSakit, totalLibur);

      bodyMasuk.push(rowM);
      bodyPulang.push(rowP);
    });

    doc.setFontSize(10);
    doc.text("Absen Masuk", 14, 25);
    autoTable(doc, {
      startY: 28,
      head: [headRow],
      body: bodyMasuk,
      theme: 'grid',
      styles: { fontSize: 5, cellPadding: 0.5, overflow: 'linebreak' },
      headStyles: { fillColor: [41, 128, 185], fontSize: 5 },
      columnStyles: { 0: { cellWidth: 5 }, 1: { cellWidth: 20 }, 2: { cellWidth: 15 } }
    });
    
    doc.addPage();
    doc.setFontSize(12);
    doc.text(`Laporan Rekapitulasi Kehadiran (${reportStartDate} s/d ${reportEndDate})`, 14, 15);
    doc.setFontSize(10);
    doc.text("Absen Pulang", 14, 25);
    
    autoTable(doc, {
      startY: 28,
      head: [headRow],
      body: bodyPulang,
      theme: 'grid',
      styles: { fontSize: 5, cellPadding: 0.5, overflow: 'linebreak' },
      headStyles: { fillColor: [41, 128, 185], fontSize: 5 },
      columnStyles: { 0: { cellWidth: 5 }, 1: { cellWidth: 20 }, 2: { cellWidth: 15 } }
    });

    doc.save(`Laporan_Keseluruhan_Pejuang_${reportStartDate}_sd_${reportEndDate}.pdf`);
  };


  const handleExportIndividualPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Laporan Individu: ${activePejuang.name}`, 14, 15);
    doc.setFontSize(11);
    doc.text(`Sub Divisi: ${activePejuang.subDivisi}`, 14, 22);
    doc.text(`Amanah: ${activePejuang.amanah}`, 14, 28);
    
    // Ringkasan
    doc.setFontSize(12);
    doc.text('Ringkasan Kinerja', 14, 40);
    const summaryData = [
      ['Hadir Tepat Waktu', totalHadir],
      ['Terlambat', totalTerlambat],
      ['Sakit', totalSakit],
      ['Izin Keluar', userExits.length],
      ['Cuti', userLeaves.length],
      ['Slip Ubar Uploaded', userSlipUbars.length],
    ];
    autoTable(doc, {
      startY: 45,
      head: [['Kategori', 'Total']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Log Presensi
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Log Presensi Harian', 14, finalY);
    const attBody = userAtt.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => [
      a.date,
      ['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : a.time,
      ['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : (a.timePulang ? a.timePulang : (a.date < getLocalDateString() ? 'Tidak Absen Pulang' : '-')),
      a.status,
      a.notes || '-'
    ]);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status', 'Keterangan']],
      body: attBody,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
    });

    // Izin Keluar
    finalY = (doc as any).lastAutoTable.finalY + 15;
    if (finalY > 250) { doc.addPage(); finalY = 20; }
    doc.text('Riwayat Izin Keluar', 14, finalY);
    const izinBody = userExits.map(e => [
      e.tanggalKeluar,
      e.tanggalIzinSampai,
      e.alasan,
      e.status
    ]);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Tgl Keluar', 'Tgl Kembali', 'Alasan', 'Status']],
      body: izinBody,
      theme: 'grid',
      headStyles: { fillColor: [142, 68, 173] },
    });

    // Slip Ubar
    finalY = (doc as any).lastAutoTable.finalY + 15;
    if (finalY > 250) { doc.addPage(); finalY = 20; }
    doc.text('Riwayat Slip Ubar', 14, finalY);
    const ubarBody = userSlipUbars.map(u => [
      u.periode,
      u.tanggalUpload,
      u.fileName
    ]);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Periode', 'Tanggal Upload', 'Nama File']],
      body: ubarBody,
      theme: 'grid',
      headStyles: { fillColor: [211, 84, 0] },
    });

    doc.save(`Laporan_Pejuang_${activePejuang.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Download className="w-4 h-4" />
            <span>Pusat Laporan & Ekspor Data Pejuang</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
            Unduh Laporan Individu Pejuang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ekspor laporan komprehensif ke format CSV atau cetak dokumen PDF resmi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh CSV</span>
          </button>
          <button
            onClick={handleExportIndividualPDF}
            className="py-2.5 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <FileDown className="w-4 h-4" />
            <span>Unduh PDF</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      
          {/* Grafik Keseluruhan Pejuang */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md mt-4 mb-8">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
              Tren Status Absensi Keseluruhan ({reportStartDate} s/d {reportEndDate})
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overallChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(203, 213, 225, 0.2)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Total" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {
                      overallChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
{/* Select Pejuang Target (for Admin) */}
      {currentUser.role === 'Admin' && (
        <>
          <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-100 mb-1">
                Laporan Keseluruhan Pejuang
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Unduh rekapitulasi seluruh pejuang (Excel/PDF) berdasarkan rentang waktu
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="p-1.5 text-xs rounded-lg bg-transparent border-none outline-none text-slate-800 dark:text-slate-100"
                />
                <span className="text-xs font-bold text-slate-400">-</span>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="p-1.5 text-xs rounded-lg bg-transparent border-none outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportAllExcel}
                  className="py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Unduh Excel</span>
                </button>
                <button
                  onClick={handleExportAllPDF}
                  className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Unduh PDF</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg flex flex-col gap-4">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Pilih Pejuang Sasaran Laporan:
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Cari nama pejuang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              
              <select
                value={divisiFilter}
                onChange={(e) => setDivisiFilter(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Semua">Semua Divisi</option>
                {uniqueDivisions.map((div, i) => (
                  <option key={i} value={div}>{div}</option>
                ))}
              </select>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Shift/Jadwal</option>
                {(schedules || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.targetName} ({s.jamMasuk} - {s.jamPulang})
                  </option>
                ))}
              </select>

              <select
                value={selectedPejuangId}
                onChange={(e) => setSelectedPejuangId(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500"
              >
                {pejuangAccounts.length === 0 && <option value="">Tidak ada pejuang ditemukan</option>}
                {pejuangAccounts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.subDivisi} ({p.amanah})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Printable Report Document Card */}
      <div
        id="printable-report"
        className="p-8 rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
      >
        {/* Report Header Logo Banner */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-emerald-600">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-black text-xl flex items-center justify-center">
              AB
            </div>
            <div>
              <h2 className="font-black text-lg text-emerald-800 dark:text-emerald-400">
                YAYASAN AL-BAHJAH CABANG CIREBON 1
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Divisi Kepondokan - Laporan Kinerja & Rekapitulasi Pejuang
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</div>
            <div className="font-bold text-emerald-600">Status: Resmi & Aktif</div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Nama Pejuang
            </div>
            <div className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
              {activePejuang.name}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Sub Divisi
            </div>
            <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
              {activePejuang.subDivisi}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Amanah Tugas
            </div>
            <div className="font-bold text-xs text-slate-700 dark:text-slate-200">
              {activePejuang.amanah}
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
            <div className="text-[10px] font-bold text-emerald-700 uppercase">
              Hadir Tepat Waktu
            </div>
            <div className="text-xl font-extrabold text-emerald-700">{totalHadir}</div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200">
            <div className="text-[10px] font-bold text-amber-700 uppercase">
              Terlambat Hadir
            </div>
            <div className="text-xl font-extrabold text-amber-700">{totalTerlambat}</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
            <div className="text-[10px] font-bold text-emerald-700 uppercase">
              Total Izin Keluar
            </div>
            <div className="text-xl font-extrabold text-emerald-700">{userExits.length}</div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200">
            <div className="text-[10px] font-bold text-rose-700 uppercase">
              Teguran & SP
            </div>
            <div className="text-xl font-extrabold text-rose-700">{userWarnings.length}</div>
          </div>
        </div>

        {/* Attendance Consistency Chart */}
        <div className="p-4 rounded-3xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Konsistensi Kehadiran (7 Hari Terakhir)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  domain={[0, 1]} 
                  ticks={[0, 0.5, 1]} 
                  tickFormatter={(val) => {
                    if (val === 1) return 'Hadir';
                    if (val === 0.5) return 'Telat';
                    return 'Absen';
                  }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any, props: any) => [props.payload.status, 'Status']}
                />
                <Bar dataKey="Konsistensi" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {
                    last7DaysData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Detail Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Log Presensi Harian ({userAtt.length} Entri)
          </h3>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-500 uppercase">
                <tr>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Jam Masuk</th>
                  <th className="p-2.5">Jam Pulang</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {userAtt.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center italic text-slate-400">
                      Tidak ada rekaman presensi.
                    </td>
                  </tr>
                ) : (
                  userAtt.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((a) => (
                    <tr key={a.id}>
                      <td className="p-2.5 font-medium">{a.date}</td>
                      <td className="p-2.5 font-bold text-emerald-600">{['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : a.time}</td>
                      <td className="p-2.5 font-bold text-amber-600">{['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : (a.timePulang ? a.timePulang : (a.date < getLocalDateString() ? 'Tidak Absen Pulang' : '-'))}</td>
                      <td className="p-2.5">
                        <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold ${
                          a.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700' :
                          a.status === 'Terlambat' ? 'bg-orange-100 text-orange-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-2.5 truncate max-w-[150px]">{a.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exit Permissions Detail Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Rekap Izin Keluar Pondok ({userExits.length} Entri)
          </h3>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-500 uppercase">
                <tr>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Alasan</th>
                  <th className="p-2.5">Jam Harus Kembali</th>
                  <th className="p-2.5">Jam Real</th>
                  <th className="p-2.5">Keterangan Terlambat</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {userExits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center italic text-slate-400">
                      Tidak ada rekap izin keluar.
                    </td>
                  </tr>
                ) : (
                  userExits.map((e) => (
                    <tr key={e.id}>
                      <td className="p-2.5 font-medium">{e.tanggalKeluar}</td>
                      <td className="p-2.5">{e.alasan}</td>
                      <td className="p-2.5">{e.jamHarusKembali}</td>
                      <td className="p-2.5">{e.jamKembaliReal || '-'}</td>
                      <td className="p-2.5 font-bold text-rose-600">
                        {e.keteranganKeterlambatan || '-'}
                      </td>
                      <td className="p-2.5 font-bold">{e.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Requests Detail Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Rekap Cuti Pejuang ({userLeaves.length} Entri)
          </h3>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-500 uppercase">
                <tr>
                  <th className="p-2.5">Mulai</th>
                  <th className="p-2.5">Selesai</th>
                  <th className="p-2.5">Durasi</th>
                  <th className="p-2.5">Alasan</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {userLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center italic text-slate-400">
                      Tidak ada rekap cuti.
                    </td>
                  </tr>
                ) : (
                  userLeaves.map((l) => (
                    <tr key={l.id}>
                      <td className="p-2.5 font-medium">{l.tanggalMulai}</td>
                      <td className="p-2.5">{l.tanggalSelesai}</td>
                      <td className="p-2.5 font-bold">{l.totalHari} Hari</td>
                      <td className="p-2.5">{l.alasan}</td>
                      <td className="p-2.5 font-bold text-amber-600">{l.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
