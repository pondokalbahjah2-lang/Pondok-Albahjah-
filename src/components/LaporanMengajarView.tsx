import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileSpreadsheet,
  FileDown,
  Download,
  Calendar,
  Filter,
  Search,
  School,
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Printer,
  ChevronDown,
  ShieldCheck,
  Building2,
  ArrowRight
} from 'lucide-react';
import {
  UserAccount,
  TeachingSchedule,
  TeachingAttendance,
  TeachingSubstitution,
  TeachingReportSummary,
  TeachingReportItem,
} from '../types';
import { useTeachingData } from '../hooks/useTeachingData';
import {
  calculateCutoffRange,
  getDatesBetween,
  formatMenitKeJamMenit,
} from '../utils/teachingUtils';
import { triggerHapticFeedback, HAPTIC_PATTERNS } from '../utils/vibration';

interface LaporanMengajarViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  teachingHook?: ReturnType<typeof useTeachingData>;
}

export const LaporanMengajarView: React.FC<LaporanMengajarViewProps> = ({
  currentUser,
  accounts,
  teachingHook: externalHook,
}) => {
  const defaultHook = useTeachingData(currentUser);
  const teachingData = externalHook || defaultHook;

  const {
    attendances,
    schedules,
    substitutions,
    teachingSettings,
    generateTeachingReport,
    getWIBDate,
  } = teachingData;

  // Default cutoff dates
  const defaultCutoff = useMemo(() => {
    return calculateCutoffRange(
      teachingSettings.cutoffStartDay ?? 21,
      teachingSettings.cutoffEndDay ?? 20,
      getWIBDate()
    );
  }, [teachingSettings, getWIBDate]);

  const [startDate, setStartDate] = useState<string>(defaultCutoff.startDate);
  const [endDate, setEndDate] = useState<string>(defaultCutoff.endDate);
  const [selectedUnit, setSelectedUnit] = useState<string>('Semua');
  const [selectedPejuangId, setSelectedPejuangId] = useState<string>(
    currentUser.role === 'Admin' ? 'Semua' : currentUser.id
  );
  const [searchTeacher, setSearchTeacher] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'rekap' | 'detail'>('rekap');
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Quick preset dates
  const handlePresetSelect = (preset: 'cutoff-current' | 'cutoff-prev' | 'this-month' | 'last-month') => {
    const nowStr = getWIBDate();
    const nowDate = new Date(nowStr);
    const startCutoff = teachingSettings.cutoffStartDay ?? 21;
    const endCutoff = teachingSettings.cutoffEndDay ?? 20;

    if (preset === 'cutoff-current') {
      const r = calculateCutoffRange(startCutoff, endCutoff, nowDate);
      setStartDate(r.startDate);
      setEndDate(r.endDate);
    } else if (preset === 'cutoff-prev') {
      const prev = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1);
      const r = calculateCutoffRange(startCutoff, endCutoff, prev);
      setStartDate(r.startDate);
      setEndDate(r.endDate);
    } else if (preset === 'this-month') {
      const y = nowDate.getFullYear();
      const m = String(nowDate.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, nowDate.getMonth() + 1, 0).getDate();
      setStartDate(`${y}-${m}-01`);
      setEndDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
    } else if (preset === 'last-month') {
      const lastMonthDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1);
      const y = lastMonthDate.getFullYear();
      const m = String(lastMonthDate.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, lastMonthDate.getMonth() + 1, 0).getDate();
      setStartDate(`${y}-${m}-01`);
      setEndDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
    }
  };

  // Generate Report Data
  const reportData: TeachingReportSummary = useMemo(() => {
    return generateTeachingReport({
      startDate,
      endDate,
      unit: selectedUnit,
      pejuangId: selectedPejuangId !== 'Semua' ? selectedPejuangId : undefined,
      accounts,
    });
  }, [generateTeachingReport, startDate, endDate, selectedUnit, selectedPejuangId, accounts]);

  // Filtered teachers list for UI
  const filteredTeacherSummaries = useMemo(() => {
    if (!searchTeacher.trim()) return reportData.teacherSummaries;
    const q = searchTeacher.toLowerCase();
    return reportData.teacherSummaries.filter(
      (t) =>
        t.pejuangName.toLowerCase().includes(q) ||
        (t.nipy && t.nipy.toLowerCase().includes(q)) ||
        (t.unit && t.unit.toLowerCase().includes(q))
    );
  }, [reportData.teacherSummaries, searchTeacher]);

  // Filtered detail attendance records
  const filteredDetailRecords = useMemo(() => {
    return reportData.detailRecords.filter((d) => {
      const matchUnit = selectedUnit === 'Semua' || d.unit === selectedUnit;
      const matchTeacher =
        selectedPejuangId === 'Semua' ||
        d.pejuangId === selectedPejuangId ||
        d.actualPejuangId === selectedPejuangId;
      const matchSearch =
        !searchTeacher.trim() ||
        d.pejuangName.toLowerCase().includes(searchTeacher.toLowerCase()) ||
        d.actualPejuangName.toLowerCase().includes(searchTeacher.toLowerCase()) ||
        d.subject.toLowerCase().includes(searchTeacher.toLowerCase());
      return matchUnit && matchTeacher && matchSearch;
    });
  }, [reportData.detailRecords, selectedUnit, selectedPejuangId, searchTeacher]);

  // EXPORT TO EXCEL (.XLSX) WITH EXCELJS
  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    triggerHapticFeedback(HAPTIC_PATTERNS.LIGHT);

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Portal Pejuang Al-Bahjah Cirebon 1';
      workbook.created = new Date();

      // -------------------------------------------------------------
      // SHEET 1: REKAPITULASI JP MENGAJAR
      // -------------------------------------------------------------
      const sheetRekap = workbook.addWorksheet('Rekapitulasi JP Pengajar', {
        pageSetup: { orientation: 'landscape', paperSize: 9 }, // A4 landscape
      });

      // Title & Header Rows
      sheetRekap.mergeCells('A1:L1');
      const titleCell1 = sheetRekap.getCell('A1');
      titleCell1.value = 'YAYASAN AL-BAHJAH CABANG CIREBON 1';
      titleCell1.font = { bold: true, size: 14, color: { argb: 'FF0F5132' } };
      titleCell1.alignment = { horizontal: 'center' };

      sheetRekap.mergeCells('A2:L2');
      const titleCell2 = sheetRekap.getCell('A2');
      titleCell2.value = 'DIVISI PENDIDIKAN & KEPONDOKAN - REKAPITULASI JAM PELAJARAN (JP) MENGAJAR';
      titleCell2.font = { bold: true, size: 12 };
      titleCell2.alignment = { horizontal: 'center' };

      sheetRekap.mergeCells('A3:L3');
      const titleCell3 = sheetRekap.getCell('A3');
      titleCell3.value = `Periode Cutoff: ${startDate} s/d ${endDate} | Unit: ${selectedUnit}`;
      titleCell3.font = { italic: true, size: 10, color: { argb: 'FF555555' } };
      titleCell3.alignment = { horizontal: 'center' };

      sheetRekap.addRow([]); // Blank line

      // Table Header Row
      const headerRow = sheetRekap.addRow([
        'No',
        'NIPY',
        'Nama Pengajar',
        'Unit',
        'Nama Bank',
        'No. Rekening',
        'Sesi Terjadwal',
        'JP Terjadwal',
        'JP Tepat Waktu',
        'JP Terlambat',
        'JP Badal (+)',
        'TOTAL JP BERSIH (RIAIL)',
      ]);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF198754' }, // Emerald Al-Bahjah
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      headerRow.height = 28;

      // Data Rows
      filteredTeacherSummaries.forEach((t, idx) => {
        const row = sheetRekap.addRow([
          idx + 1,
          t.nipy || '-',
          t.pejuangName,
          t.unit || '-',
          t.namaBank || '-',
          t.noRekening || '-',
          t.totalSesiTerjadwal,
          t.totalJPTerjadwal,
          t.totalJPHadir,
          t.totalJPTerlambat,
          t.totalJPBadal,
          t.totalJPNetto,
        ]);

        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          };
          if (colNumber === 1 || colNumber === 2 || (colNumber >= 7 && colNumber <= 12)) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          if (colNumber === 12) {
            cell.font = { bold: true, color: { argb: 'FF0F5132' } };
          }
        });

        // Zebra striping
        if (idx % 2 === 1) {
          row.eachCell((cell) => {
            if (!cell.fill) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF8F9FA' },
              };
            }
          });
        }
      });

      // Total Summary Row
      const totalRow = sheetRekap.addRow([
        '',
        '',
        'TOTAL KESELURUHAN',
        '',
        '',
        '',
        reportData.totalSesiTerjadwal,
        reportData.totalJPTerjadwal,
        reportData.totalJPHadir,
        reportData.totalJPTerlambat,
        reportData.totalJPBadal,
        reportData.totalJPNetto,
      ]);

      totalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE9ECEF' },
        };
        cell.border = {
          top: { style: 'medium' },
          bottom: { style: 'double' },
        };
      });

      // Set column widths
      sheetRekap.columns = [
        { width: 6 }, // No
        { width: 14 }, // NIPY
        { width: 28 }, // Nama Pengajar
        { width: 12 }, // Unit
        { width: 12 }, // Bank
        { width: 18 }, // Rekening
        { width: 14 }, // Sesi
        { width: 14 }, // JP Terjadwal
        { width: 14 }, // JP Hadir
        { width: 14 }, // JP Terlambat
        { width: 14 }, // JP Badal
        { width: 22 }, // Total JP Netto
      ];

      // -------------------------------------------------------------
      // SHEET 2: DETAIL LOG PRESENSI
      // -------------------------------------------------------------
      const sheetDetail = workbook.addWorksheet('Detail Presensi');
      sheetDetail.addRow([
        'No',
        'Tanggal',
        'Unit',
        'Kelas',
        'Mata Pelajaran',
        'Pengajar Terjadwal',
        'Pengajar Riil (Badal)',
        'Jam Masuk',
        'Jam Pulang',
        'JP Riil',
        'Status',
        'Keterangan',
      ]).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0D6EFD' },
        };
      });

      filteredDetailRecords.forEach((d, idx) => {
        sheetDetail.addRow([
          idx + 1,
          d.date,
          d.unit,
          d.className,
          d.subject,
          d.pejuangName,
          d.actualPejuangName,
          d.jamMasuk || '-',
          d.jamPulang || '-',
          d.actualJP ?? d.jumlahJP,
          d.status,
          d.isBadal ? `Badal dari ${d.pejuangName}` : d.source || '-',
        ]);
      });

      sheetDetail.columns = [
        { width: 6 },
        { width: 13 },
        { width: 12 },
        { width: 16 },
        { width: 22 },
        { width: 24 },
        { width: 24 },
        { width: 12 },
        { width: 12 },
        { width: 10 },
        { width: 14 },
        { width: 24 },
      ];

      // Download buffer as file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rekap_JP_Mengajar_Al-Bahjah_${startDate}_sd_${endDate}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      triggerHapticFeedback(HAPTIC_PATTERNS.SUCCESS);
    } catch (err: any) {
      console.error('Error generating Excel:', err);
      alert(`Gagal membuat file Excel: ${err.message}`);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // EXPORT TO PDF WITH JSPDF & AUTO-TABLE
  const handleExportPDF = () => {
    setIsExportingPDF(true);
    triggerHapticFeedback(HAPTIC_PATTERNS.LIGHT);

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Official Al-Bahjah Letterhead
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 81, 50); // Emerald color
      doc.text('YAYASAN AL-BAHJAH CABANG CIREBON 1', pageWidth / 2, 14, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(33, 37, 41);
      doc.text('DIVISI PENDIDIKAN & KEPONDOKAN', pageWidth / 2, 20, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `LAPORAN REKAPITULASI KEHADIRAN & JAM PELAJARAN (JP) MENGAJAR`,
        pageWidth / 2,
        26,
        { align: 'center' }
      );

      doc.setFontSize(8);
      doc.setTextColor(108, 117, 125);
      doc.text(
        `Periode Cutoff: ${startDate} s/d ${endDate} | Unit: ${selectedUnit} | Dicetak pada: ${new Date().toLocaleDateString('id-ID')} WIB`,
        pageWidth / 2,
        31,
        { align: 'center' }
      );

      // Dividing green line
      doc.setDrawColor(25, 135, 84);
      doc.setLineWidth(0.8);
      doc.line(14, 34, pageWidth - 14, 34);

      // Table Header & Rows
      const tableHead = [
        [
          'No',
          'NIPY',
          'Nama Pengajar',
          'Unit',
          'Bank & Rekening',
          'Sesi',
          'JP Sch',
          'Hadir',
          'Telat',
          'Badal (+)',
          'TOTAL JP BERSIH',
        ],
      ];

      const tableBody = filteredTeacherSummaries.map((t, idx) => [
        idx + 1,
        t.nipy || '-',
        t.pejuangName,
        t.unit || '-',
        t.noRekening ? `${t.namaBank || 'Bank'} ${t.noRekening}` : '-',
        t.totalSesiTerjadwal,
        t.totalJPTerjadwal,
        t.totalJPHadir,
        t.totalJPTerlambat,
        t.totalJPBadal,
        `${t.totalJPNetto} JP`,
      ]);

      // Add Total Row
      tableBody.push([
        '',
        '',
        'TOTAL KESELURUHAN',
        '',
        '',
        reportData.totalSesiTerjadwal,
        reportData.totalJPTerjadwal,
        reportData.totalJPHadir,
        reportData.totalJPTerlambat,
        reportData.totalJPBadal,
        `${reportData.totalJPNetto} JP`,
      ]);

      autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 38,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          font: 'helvetica',
          lineColor: [220, 224, 230],
        },
        headStyles: {
          fillColor: [25, 135, 84],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'center', cellWidth: 22 },
          2: { halign: 'left', cellWidth: 50 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'left', cellWidth: 40 },
          5: { halign: 'center', cellWidth: 14 },
          6: { halign: 'center', cellWidth: 16 },
          7: { halign: 'center', cellWidth: 16 },
          8: { halign: 'center', cellWidth: 16 },
          9: { halign: 'center', cellWidth: 18 },
          10: { halign: 'center', fontStyle: 'bold', cellWidth: 32 },
        },
        didParseCell: (data) => {
          // Highlight total row
          if (data.row.index === tableBody.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 243, 246];
          }
        },
      });

      // Signature area at bottom
      const finalY = (doc as any).lastAutoTable.finalY + 12;
      if (finalY < 185) {
        doc.setFontSize(8);
        doc.setTextColor(33, 37, 41);

        const leftX = 30;
        const rightX = pageWidth - 65;

        doc.text('Mengetahui,', leftX, finalY);
        doc.text('Koordinator Pendidikan / Kepondokan', leftX, finalY + 4);
        doc.text('( ................................................ )', leftX, finalY + 24);

        doc.text('Cirebon, ' + new Date().toLocaleDateString('id-ID'), rightX, finalY);
        doc.text('Petugas Administrasi & Absensi', rightX, finalY + 4);
        doc.text(`( ${currentUser.name} )`, rightX, finalY + 24);
      }

      doc.save(`Laporan_JP_Mengajar_Al-Bahjah_${startDate}_sd_${endDate}.pdf`);
      triggerHapticFeedback(HAPTIC_PATTERNS.SUCCESS);
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      alert(`Gagal membuat file PDF: ${err.message}`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Laporan Rekapitulasi Jam Pelajaran (JP)
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Ubar &amp; Honor Mengajar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rekap kehadiran mengajar, akumulasi JP riil, delegasi badal, dan data perbankan pengajar
              </p>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExportingExcel ? 'Menyiapkan...' : 'Unduh Excel (.xlsx)'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/25 active:scale-98 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingPDF ? 'Menyiapkan...' : 'Unduh PDF'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Quick Preset Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto hide-scrollbar pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Pilihan Cepat:</span>
            <button
              type="button"
              onClick={() => handlePresetSelect('cutoff-current')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap text-[11px]"
            >
              Cutoff Berjalan (21 s/d 20)
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('cutoff-prev')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap text-[11px]"
            >
              Cutoff Bulan Lalu
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('this-month')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap text-[11px]"
            >
              Bulan Berjalan
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('last-month')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap text-[11px]"
            >
              Bulan Lalu
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Unit Pendidikan
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="Semua">Semua Unit</option>
                <option value="SMPIQu">SMPIQu</option>
                <option value="SMAIQu">SMAIQu</option>
                <option value="SDIQu">SDIQu</option>
                <option value="Tahfidz">Tahfidz</option>
                <option value="Umum">Umum</option>
              </select>
            </div>

            {currentUser.role === 'Admin' ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Pilih Pengajar
                </label>
                <select
                  value={selectedPejuangId}
                  onChange={(e) => setSelectedPejuangId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="Semua">Semua Pengajar ({accounts.filter((a) => a.isPengajar).length})</option>
                  {accounts
                    .filter((a) => a.isPengajar)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.subDivisi || 'Pengajar'})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Pengajar Terpilih
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aggregate KPI Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Sesi Terjadwal</div>
          <div className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {reportData.totalSesiTerjadwal} <span className="text-xs font-normal text-slate-400">sesi</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total JP Terjadwal</div>
          <div className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {reportData.totalJPTerjadwal} <span className="text-xs font-normal text-slate-400">JP</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-emerald-500">JP Hadir Tepat Waktu</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {reportData.totalJPHadir} <span className="text-xs font-normal text-slate-400">JP</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-amber-500">JP Terlambat</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {reportData.totalJPTerlambat} <span className="text-xs font-normal text-slate-400">JP</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 shadow-sm">
          <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
            TOTAL JP BERSIH RIAIL
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {reportData.totalJPNetto} <span className="text-sm font-bold">JP</span>
          </div>
        </div>
      </div>

      {/* View Switcher: Rekapitulasi vs Detail Pertemuan */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('rekap')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rekap'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Rekapitulasi Per Pengajar ({filteredTeacherSummaries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('detail')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'detail'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Detail Log Pertemuan ({filteredDetailRecords.length})
          </button>
        </div>

        <div className="w-64 hidden sm:block">
          <input
            type="text"
            placeholder="Cari nama atau NIPY..."
            value={searchTeacher}
            onChange={(e) => setSearchTeacher(e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
        </div>
      </div>

      {/* TAB 1: REKAPITULASI PER PENGAJAR */}
      {activeTab === 'rekap' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">NIPY</th>
                  <th className="py-2.5 px-3">Nama Pengajar</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Rekening Bank</th>
                  <th className="py-2.5 px-3 text-center">Sesi</th>
                  <th className="py-2.5 px-3 text-center">JP Sch</th>
                  <th className="py-2.5 px-3 text-center">Hadir</th>
                  <th className="py-2.5 px-3 text-center">Telat</th>
                  <th className="py-2.5 px-3 text-center">Badal (+)</th>
                  <th className="py-2.5 px-3 text-center font-bold text-emerald-600">
                    TOTAL JP RIAIL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {filteredTeacherSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      Tidak ada data mengajar yang sesuai filter periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredTeacherSummaries.map((t, idx) => (
                    <tr key={t.pejuangId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono">{t.nipy || '-'}</td>
                      <td className="py-3 px-3 font-bold">{t.pejuangName}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                          {t.unit || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {t.noRekening ? (
                          <div>
                            <div className="font-bold">{t.namaBank || 'Bank'}</div>
                            <div className="font-mono text-[11px] text-slate-400">{t.noRekening}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum diisi</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">{t.totalSesiTerjadwal}</td>
                      <td className="py-3 px-3 text-center font-bold">{t.totalJPTerjadwal}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">
                        {t.totalJPHadir}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-600">
                        {t.totalJPTerlambat}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-purple-600">
                        {t.totalJPBadal}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {t.totalJPNetto} JP
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredTeacherSummaries.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-300 dark:border-slate-700 font-bold bg-slate-50/80 dark:bg-slate-800/50">
                    <td colSpan={5} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                      Total Rekapitulasi:
                    </td>
                    <td className="py-3 px-3 text-center">{reportData.totalSesiTerjadwal}</td>
                    <td className="py-3 px-3 text-center">{reportData.totalJPTerjadwal}</td>
                    <td className="py-3 px-3 text-center text-emerald-600">{reportData.totalJPHadir}</td>
                    <td className="py-3 px-3 text-center text-amber-600">{reportData.totalJPTerlambat}</td>
                    <td className="py-3 px-3 text-center text-purple-600">{reportData.totalJPBadal}</td>
                    <td className="py-3 px-3 text-center text-sm font-black text-emerald-600">
                      {reportData.totalJPNetto} JP
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DETAIL LOG PERTEMUAN */}
      {activeTab === 'detail' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Unit / Kelas</th>
                  <th className="py-2.5 px-3">Mata Pelajaran</th>
                  <th className="py-2.5 px-3">Pengajar Terjadwal</th>
                  <th className="py-2.5 px-3">Pengajar Riil</th>
                  <th className="py-2.5 px-3">Jam Masuk - Pulang</th>
                  <th className="py-2.5 px-3">JP</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {filteredDetailRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada rekaman presensi mengajar pada rentang tanggal ini.
                    </td>
                  </tr>
                ) : (
                  filteredDetailRecords.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {d.date}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 mr-1.5">
                          {d.unit}
                        </span>
                        {d.className}
                      </td>
                      <td className="py-3 px-3 font-bold">{d.subject}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {d.pejuangName}
                      </td>
                      <td className="py-3 px-3">
                        {d.isBadal ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            Badal: {d.actualPejuangName}
                          </span>
                        ) : (
                          d.actualPejuangName
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="text-emerald-600 font-bold">{d.jamMasuk || '-'}</span>
                        {' → '}
                        <span className="text-blue-600 font-bold">{d.jamPulang || '-'}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600">
                        {d.actualJP ?? d.jumlahJP} JP
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'Hadir'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : d.status === 'Terlambat'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
