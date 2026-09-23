import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  JPPengajarSummary,
  AttendanceRekapItem,
  TeachingSessionDetailItem,
  TeachingBadalRekapItem
} from '../types';
import { PeriodCutOffInfo, formatIndoDate } from './teachingUtils';

/**
 * Konversi nomor kolom 1-indexed ke huruf kolom Excel (e.g. 1 -> A, 27 -> AA)
 */
function getExcelColumnName(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFB0B0B0' } },
  left: { style: 'thin', color: { argb: 'FFB0B0B0' } },
  bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } },
  right: { style: 'thin', color: { argb: 'FFB0B0B0' } }
};

/**
 * Export 4-Sheet Excel Workbook for Teaching & JP Management
 */
export async function exportTeachingExcel(
  unit: string,
  periodInfo: PeriodCutOffInfo,
  jpGridData: JPPengajarSummary[],
  attendanceRekap: AttendanceRekapItem[],
  detailSesi: TeachingSessionDetailItem[],
  rekapBadal: TeachingBadalRekapItem[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistem Absensi Kepegawaian Al-Bahjah';
  workbook.created = new Date();

  const safeUnitName = (unit || 'SemuaUnit').replace(/\s+/g, '');
  const fileName = `JP_${safeUnitName}_${periodInfo.codeLabel}.xlsx`;

  // =========================================================================
  // SHEET 1: REKAP JP (Format Matriks Sesuai Template ARGB)
  // =========================================================================
  const sheetJP = workbook.addWorksheet('Rekap JP', {
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }
  });

  sheetJP.views = [{ showGridLines: true }];

  // Baris Header:
  // Row 1: NO, NAMA PENGAJAR, MAPEL, [Tanggal Cut-Off Header (EAD1DC)], TOTAL JP
  // Row 2: Bulan (D9EAD3 vs FFF2CC)
  // Row 3: Angka Tanggal (A9D18D vs 9CC3E6)

  const numDates = periodInfo.dates.length;
  const prevMonthCount = periodInfo.prevMonthDates.length;
  const currMonthCount = periodInfo.currMonthDates.length;

  const startColDateIdx = 4; // Col D is first date (A=NO, B=NAMA, C=MAPEL, D...=Date)
  const totalColIdx = startColDateIdx + numDates; // Col after last date

  // Lebar kolom
  sheetJP.getColumn(1).width = 6;  // NO
  sheetJP.getColumn(2).width = 23; // NAMA PENGAJAR
  sheetJP.getColumn(3).width = 17; // MAPEL
  for (let i = 0; i < numDates; i++) {
    sheetJP.getColumn(startColDateIdx + i).width = 5.2; // Kolom tanggal sempit
  }
  sheetJP.getColumn(totalColIdx).width = 12; // TOTAL JP

  // Set Row Heights
  sheetJP.getRow(1).height = 18;
  sheetJP.getRow(2).height = 18;
  sheetJP.getRow(3).height = 18;

  // Merge headers untuk NO, NAMA PENGAJAR, MAPEL, TOTAL JP (Rows 1-3)
  sheetJP.mergeCells(1, 1, 3, 1);
  sheetJP.mergeCells(1, 2, 3, 2);
  sheetJP.mergeCells(1, 3, 3, 3);
  sheetJP.mergeCells(1, totalColIdx, 3, totalColIdx);

  // Cell NO
  const cellNo = sheetJP.getCell(1, 1);
  cellNo.value = 'NO';
  cellNo.font = { name: 'Lexend', size: 10, bold: true };
  cellNo.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cellNo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
  cellNo.border = thinBorder;

  // Cell NAMA PENGAJAR
  const cellNama = sheetJP.getCell(1, 2);
  cellNama.value = 'NAMA PENGAJAR';
  cellNama.font = { name: 'Lexend', size: 10, bold: true };
  cellNama.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cellNama.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
  cellNama.border = thinBorder;

  // Cell MAPEL
  const cellMapel = sheetJP.getCell(1, 3);
  cellMapel.value = 'MAPEL';
  cellMapel.font = { name: 'Lexend', size: 10, bold: true };
  cellMapel.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cellMapel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
  cellMapel.border = thinBorder;

  // Cell TOTAL JP
  const cellTotalJP = sheetJP.getCell(1, totalColIdx);
  cellTotalJP.value = 'Total JP';
  cellTotalJP.font = { name: 'Lexend', size: 10, bold: true };
  cellTotalJP.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cellTotalJP.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
  cellTotalJP.border = thinBorder;

  // Row 1 Tanggal: Header gabungan tanggal (EAD1DC)
  sheetJP.mergeCells(1, startColDateIdx, 1, startColDateIdx + numDates - 1);
  const cellDateHeader = sheetJP.getCell(1, startColDateIdx);
  cellDateHeader.value = `TANGGAL PEMBELAJARAN (${periodInfo.formattedRange.toUpperCase()})`;
  cellDateHeader.font = { name: 'Lexend', size: 10, bold: true };
  cellDateHeader.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cellDateHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAD1DC' } };
  cellDateHeader.border = thinBorder;

  // Row 2: Bulan (Berselang-seling per bulan: D9EAD3 lalu FFF2CC)
  // Merge bulan lalu
  sheetJP.mergeCells(2, startColDateIdx, 2, startColDateIdx + prevMonthCount - 1);
  const cellPrevMonth = sheetJP.getCell(2, startColDateIdx);
  cellPrevMonth.value = periodInfo.prevMonthName.toUpperCase();
  cellPrevMonth.font = { name: 'Lexend', size: 10, bold: true };
  cellPrevMonth.alignment = { vertical: 'middle', horizontal: 'center' };
  cellPrevMonth.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
  cellPrevMonth.border = thinBorder;

  // Merge bulan berjalan
  sheetJP.mergeCells(2, startColDateIdx + prevMonthCount, 2, startColDateIdx + numDates - 1);
  const cellCurrMonth = sheetJP.getCell(2, startColDateIdx + prevMonthCount);
  cellCurrMonth.value = periodInfo.currMonthName.toUpperCase();
  cellCurrMonth.font = { name: 'Lexend', size: 10, bold: true };
  cellCurrMonth.alignment = { vertical: 'middle', horizontal: 'center' };
  cellCurrMonth.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
  cellCurrMonth.border = thinBorder;

  // Row 3: Angka Tanggal (Berselang-seling per bulan: A9D18D lalu 9CC3E6)
  for (let i = 0; i < numDates; i++) {
    const col = startColDateIdx + i;
    const dateStr = periodInfo.dates[i];
    const dayNumber = parseInt(dateStr.split('-')[2], 10);
    const isPrevMonth = i < prevMonthCount;

    const cellDay = sheetJP.getCell(3, col);
    cellDay.value = dayNumber;
    cellDay.font = { name: 'Lexend', size: 9, bold: true };
    cellDay.alignment = { vertical: 'middle', horizontal: 'center' };
    cellDay.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isPrevMonth ? 'FFA9D18D' : 'FF9CC3E6' }
    };
    cellDay.border = thinBorder;
  }

  // Terapkan border ke seluruh sel header gabungan
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= totalColIdx; c++) {
      sheetJP.getCell(r, c).border = thinBorder;
    }
  }

  // Isi Data Baris
  let currentRowNum = 4;
  for (const item of jpGridData) {
    const row = sheetJP.getRow(currentRowNum);
    row.height = 26; // Tinggi baris data sekitar 26

    // Col 1: NO (FFF2CC)
    const c1 = row.getCell(1);
    c1.value = item.no;
    c1.font = { name: 'Lexend', size: 10 };
    c1.alignment = { vertical: 'middle', horizontal: 'center' };
    c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
    c1.border = thinBorder;

    // Col 2: NAMA PENGAJAR (D9EAD3)
    const c2 = row.getCell(2);
    c2.value = item.pejuangName;
    c2.font = { name: 'Lexend', size: 10, bold: true };
    c2.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
    c2.border = thinBorder;

    // Col 3: MAPEL (FFF2CC)
    const c3 = row.getCell(3);
    c3.value = item.mapel;
    c3.font = { name: 'Lexend', size: 10 };
    c3.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    c3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
    c3.border = thinBorder;

    // Col 4...(4+numDates-1): Sel Data Tanggal (E7E6E6)
    for (let i = 0; i < numDates; i++) {
      const col = startColDateIdx + i;
      const dateStr = periodInfo.dates[i];
      const val = item.dailyJP[dateStr];

      const cDate = row.getCell(col);
      cDate.value = val && val > 0 ? val : '';
      cDate.font = { name: 'Arial', size: 10, bold: !!(val && val > 0) };
      cDate.alignment = { vertical: 'middle', horizontal: 'center' };
      cDate.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
      cDate.border = thinBorder;
    }

    // Col Total JP: Rumus Excel SUM (D9EAD3)
    const startColLetter = getExcelColumnName(startColDateIdx);
    const endColLetter = getExcelColumnName(startColDateIdx + numDates - 1);
    const cTotal = row.getCell(totalColIdx);
    cTotal.value = {
      formula: `SUM(${startColLetter}${currentRowNum}:${endColLetter}${currentRowNum})`,
      result: item.totalJP
    };
    cTotal.font = { name: 'Lexend', size: 10, bold: true };
    cTotal.alignment = { vertical: 'middle', horizontal: 'center' };
    cTotal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
    cTotal.border = thinBorder;

    currentRowNum++;
  }

  // Baris Total Bawah (Summary Row)
  if (jpGridData.length > 0) {
    const summaryRow = sheetJP.getRow(currentRowNum);
    summaryRow.height = 24;

    sheetJP.mergeCells(currentRowNum, 1, currentRowNum, 3);
    const sumLabel = summaryRow.getCell(1);
    sumLabel.value = 'TOTAL KESELURUHAN JP';
    sumLabel.font = { name: 'Lexend', size: 10, bold: true };
    sumLabel.alignment = { vertical: 'middle', horizontal: 'center' };
    sumLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
    sumLabel.border = thinBorder;

    for (let i = 0; i < numDates; i++) {
      const col = startColDateIdx + i;
      const colLetter = getExcelColumnName(col);
      const cellSum = summaryRow.getCell(col);
      cellSum.value = {
        formula: `SUM(${colLetter}4:${colLetter}${currentRowNum - 1})`
      };
      cellSum.font = { name: 'Arial', size: 10, bold: true };
      cellSum.alignment = { vertical: 'middle', horizontal: 'center' };
      cellSum.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
      cellSum.border = thinBorder;
    }

    const totalColLetter = getExcelColumnName(totalColIdx);
    const cellGrandTotal = summaryRow.getCell(totalColIdx);
    cellGrandTotal.value = {
      formula: `SUM(${totalColLetter}4:${totalColLetter}${currentRowNum - 1})`
    };
    cellGrandTotal.font = { name: 'Lexend', size: 11, bold: true };
    cellGrandTotal.alignment = { vertical: 'middle', horizontal: 'center' };
    cellGrandTotal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
    cellGrandTotal.border = thinBorder;
  }

  // =========================================================================
  // SHEET 2: REKAP KEHADIRAN
  // =========================================================================
  const sheetRekap = workbook.addWorksheet('Rekap Kehadiran', {
    pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1 }
  });
  sheetRekap.views = [{ showGridLines: true }];

  // Title
  sheetRekap.addRow([`REKAP KEHADIRAN MENGAJAR - ${unit.toUpperCase()}`]);
  sheetRekap.addRow([`Periode: ${periodInfo.formattedRange}`]);
  sheetRekap.addRow([]);

  sheetRekap.getCell('A1').font = { name: 'Lexend', size: 12, bold: true };
  sheetRekap.getCell('A2').font = { name: 'Arial', size: 10, italic: true };

  const rekapHeaders = [
    'No',
    'Nama Pengajar',
    'Unit',
    'Total Sesi',
    'Hadir',
    'Terlambat',
    'Alpa',
    'Izin/Sakit',
    'Total Terlambat (Mnt)',
    'Total Jam Mengajar',
    'Total JP',
    'Badal Diberikan',
    'Badal Diterima',
    '% Kehadiran'
  ];

  const headerRow2 = sheetRekap.addRow(rekapHeaders);
  headerRow2.height = 24;
  headerRow2.eachCell(cell => {
    cell.font = { name: 'Lexend', size: 10, bold: true, color: { argb: 'FF1F2937' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder;
  });

  let noRekap = 1;
  for (const r of attendanceRekap) {
    const dataRow = sheetRekap.addRow([
      noRekap++,
      r.pejuangName,
      r.unit,
      r.totalSesiTerjadwal,
      r.hadir,
      r.terlambat,
      r.alpa,
      r.izinSakit,
      r.totalMenitTerlambat,
      r.totalJamMengajar,
      r.totalJP,
      r.badalDiberikan,
      r.badalDiterima,
      `${r.persenKehadiran}%`
    ]);
    dataRow.height = 20;
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10 };
      cell.border = thinBorder;
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 2 ? 'left' : 'center'
      };
    });
  }

  // Column widths for Rekap Kehadiran
  sheetRekap.columns = [
    { width: 6 },  // No
    { width: 25 }, // Nama
    { width: 14 }, // Unit
    { width: 12 }, // Total Sesi
    { width: 10 }, // Hadir
    { width: 12 }, // Terlambat
    { width: 10 }, // Alpa
    { width: 12 }, // Izin
    { width: 16 }, // Menit Terlambat
    { width: 16 }, // Jam Mengajar
    { width: 12 }, // Total JP
    { width: 14 }, // Badal Diberikan
    { width: 14 }, // Badal Diterima
    { width: 14 }  // % Kehadiran
  ];

  // =========================================================================
  // SHEET 3: DETAIL SESI
  // =========================================================================
  const sheetDetail = workbook.addWorksheet('Detail Sesi', {
    pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1 }
  });
  sheetDetail.views = [{ showGridLines: true }];

  sheetDetail.addRow([`DETAIL SESI MENGAJAR - ${unit.toUpperCase()}`]);
  sheetDetail.addRow([`Periode: ${periodInfo.formattedRange}`]);
  sheetDetail.addRow([]);

  sheetDetail.getCell('A1').font = { name: 'Lexend', size: 12, bold: true };
  sheetDetail.getCell('A2').font = { name: 'Arial', size: 10, italic: true };

  const detailHeaders = [
    'Tanggal',
    'Hari',
    'Unit',
    'Pengajar',
    'Kelas',
    'Mapel',
    'JP',
    'Lokasi',
    'Jadwal',
    'Jam Masuk',
    'Jam Pulang',
    'Durasi',
    'Status',
    'Terlambat (Mnt)',
    'Jarak GPS',
    'Badal',
    'Pengajar Asli',
    'Catatan'
  ];

  const headerRow3 = sheetDetail.addRow(detailHeaders);
  headerRow3.height = 24;
  headerRow3.eachCell(cell => {
    cell.font = { name: 'Lexend', size: 10, bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder;
  });

  for (const s of detailSesi) {
    const dataRow = sheetDetail.addRow([
      s.tanggal,
      s.hari,
      s.unit,
      s.pengajar,
      s.kelas,
      s.mapel,
      s.jp,
      s.lokasi,
      s.jadwalMulaiSelesai,
      s.jamMasuk,
      s.jamPulang,
      s.durasi,
      s.status,
      s.terlambatMenit,
      s.jarakMasukMeter,
      s.badal,
      s.pengajarAsli,
      s.catatan
    ]);
    dataRow.height = 20;
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9.5 };
      cell.border = thinBorder;
      cell.alignment = {
        vertical: 'middle',
        horizontal: [4, 6, 8, 17, 18].includes(colNumber) ? 'left' : 'center'
      };
    });
  }

  sheetDetail.columns = [
    { width: 13 }, // Tanggal
    { width: 10 }, // Hari
    { width: 12 }, // Unit
    { width: 23 }, // Pengajar
    { width: 13 }, // Kelas
    { width: 18 }, // Mapel
    { width: 7 },  // JP
    { width: 18 }, // Lokasi
    { width: 14 }, // Jadwal
    { width: 12 }, // Masuk
    { width: 12 }, // Pulang
    { width: 13 }, // Durasi
    { width: 13 }, // Status
    { width: 13 }, // Terlambat
    { width: 13 }, // Jarak
    { width: 9 },  // Badal
    { width: 22 }, // Pengajar Asli
    { width: 20 }  // Catatan
  ];

  // =========================================================================
  // SHEET 4: REKAP BADAL
  // =========================================================================
  const sheetBadal = workbook.addWorksheet('Rekap Badal', {
    pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1 }
  });
  sheetBadal.views = [{ showGridLines: true }];

  sheetBadal.addRow([`REKAP BADAL MENGAJAR - ${unit.toUpperCase()}`]);
  sheetBadal.addRow([`Periode: ${periodInfo.formattedRange}`]);
  sheetBadal.addRow([]);

  sheetBadal.getCell('A1').font = { name: 'Lexend', size: 12, bold: true };
  sheetBadal.getCell('A2').font = { name: 'Arial', size: 10, italic: true };

  const badalHeaders = [
    'Tanggal',
    'Unit',
    'Kelas',
    'Mapel',
    'JP',
    'Jadwal',
    'Pengajar Asli',
    'Pengajar Pengganti',
    'Alasan',
    'Status',
    'Disetujui Oleh'
  ];

  const headerRow4 = sheetBadal.addRow(badalHeaders);
  headerRow4.height = 24;
  headerRow4.eachCell(cell => {
    cell.font = { name: 'Lexend', size: 10, bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAD1DC' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder;
  });

  for (const b of rekapBadal) {
    const dataRow = sheetBadal.addRow([
      b.tanggal,
      b.unit,
      b.kelas,
      b.mapel,
      b.jp,
      b.jadwal,
      b.pengajarAsli,
      b.pengajarPengganti,
      b.alasan,
      b.status,
      b.disetujuiOleh
    ]);
    dataRow.height = 20;
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9.5 };
      cell.border = thinBorder;
      cell.alignment = {
        vertical: 'middle',
        horizontal: [4, 7, 8, 9].includes(colNumber) ? 'left' : 'center'
      };
    });
  }

  sheetBadal.columns = [
    { width: 13 }, // Tanggal
    { width: 12 }, // Unit
    { width: 14 }, // Kelas
    { width: 18 }, // Mapel
    { width: 8 },  // JP
    { width: 15 }, // Jadwal
    { width: 24 }, // Pengajar Asli
    { width: 24 }, // Pengajar Pengganti
    { width: 24 }, // Alasan
    { width: 15 }, // Status
    { width: 18 }  // Disetujui
  ];

  // Download buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Export Landscape A4 PDF Report for Teaching Management
 */
export function exportTeachingPDF(
  unit: string,
  periodInfo: PeriodCutOffInfo,
  jpGridData: JPPengajarSummary[],
  attendanceRekap: AttendanceRekapItem[]
): void {
  // A4 Landscape: 297 x 210 mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Multi-line Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LAPORAN JAM PELAJARAN (JP) & KEHADIRAN MENGAJAR', pageWidth / 2, 14, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Unit: ${unit} | Periode Cut-Off: ${periodInfo.formattedRange}`, pageWidth / 2, 20, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 23, pageWidth - 14, 23);

  // Section 1: Ringkasan Rekap Kehadiran
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. REKAP KEHADIRAN & TOTAL JP PER PENGAJAR', 14, 28);

  const rekapHeaders = [
    ['No', 'Nama Pengajar', 'Sesi', 'Hadir', 'Telat', 'Alpa', 'Izin', 'Terlambat (Mnt)', 'Jam Mengajar', 'Total JP', '% Hadir']
  ];

  const rekapBody = attendanceRekap.map((item, idx) => [
    idx + 1,
    item.pejuangName,
    item.totalSesiTerjadwal,
    item.hadir,
    item.terlambat,
    item.alpa,
    item.izinSakit,
    item.totalMenitTerlambat,
    item.totalJamMengajar,
    item.totalJP,
    `${item.persenKehadiran}%`
  ]);

  autoTable(doc, {
    startY: 31,
    head: rekapHeaders,
    body: rekapBody,
    theme: 'grid',
    styles: {
      font: 'Helvetica',
      fontSize: 8,
      cellPadding: 1.5,
      halign: 'center',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [217, 234, 211], // D9EAD3
      textColor: [31, 41, 55],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { halign: 'left', cellWidth: 55 }
    },
    margin: { left: 14, right: 14 }
  });

  // Section 2: Tabel Matriks JP Pengajar
  const currentY = (doc as any).lastAutoTable.finalY || 100;
  if (currentY > 140) {
    doc.addPage();
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('2. MATRIKS JAM PELAJARAN (JP) HARIAN', 14, 15);
  } else {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('2. MATRIKS JAM PELAJARAN (JP) HARIAN', 14, currentY + 10);
  }

  // Prepare date headers
  const dateColHeaders = periodInfo.dates.map(d => {
    const parts = d.split('-');
    return `${parts[2]}/${parts[1]}`;
  });

  const matrixHead = [
    ['No', 'Nama Pengajar', 'Mapel', ...dateColHeaders, 'Total JP']
  ];

  const matrixBody = jpGridData.map(item => {
    const dailyValues = periodInfo.dates.map(d => (item.dailyJP[d] && item.dailyJP[d] > 0 ? String(item.dailyJP[d]) : '-'));
    return [
      item.no,
      item.pejuangName,
      item.mapel,
      ...dailyValues,
      item.totalJP
    ];
  });

  autoTable(doc, {
    startY: currentY > 140 ? 18 : currentY + 13,
    head: matrixHead,
    body: matrixBody,
    theme: 'grid',
    styles: {
      font: 'Helvetica',
      fontSize: 6.5,
      cellPadding: 1,
      halign: 'center',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [255, 242, 204], // FFF2CC
      textColor: [31, 41, 55],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { halign: 'left', cellWidth: 38 },
      2: { halign: 'left', cellWidth: 26 }
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Halaman ${doc.internal.pages.length - 1}`;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(str, pageWidth - 20, pageHeight - 8, { align: 'right' });
      doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, pageHeight - 8);
    }
  });

  const safeUnitName = (unit || 'SemuaUnit').replace(/\s+/g, '');
  doc.save(`JP_${safeUnitName}_${periodInfo.codeLabel}.pdf`);
}
