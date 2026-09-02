import { getLocalDateString } from '../utils/dateUtils';
import { uploadPDFToDrive } from '../utils/googleDrive';
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import {
  Clock,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Filter,
  Check,
  X,
  Hourglass,
} from 'lucide-react';
import { UserAccount, ExitPermissionRecord } from '../types';

interface IzinKeluarViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  exitPermissions: ExitPermissionRecord[];
  onSaveExitPermissions: (records: ExitPermissionRecord[]) => void;
  suratIzinTemplateUrl?: string;
  kepalaPondokName?: string;
  appLogoUrl?: string;
  izinKeluarApprovers?: string[];
}

export const IzinKeluarView: React.FC<IzinKeluarViewProps> = ({
  currentUser,
  accounts,
  exitPermissions,
  onSaveExitPermissions,
  suratIzinTemplateUrl,
  kepalaPondokName,
  appLogoUrl,
  izinKeluarApprovers = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showAddModal, setShowModal] = useState(false);
  const [selectedRecordForReturn, setSelectedRecordForReturn] = useState<ExitPermissionRecord | null>(null);

  // Approval modal states
  const [approvalRecord, setApprovalRecord] = useState<ExitPermissionRecord | null>(null);
  const [approvalTanggalKeluar, setApprovalTanggalKeluar] = useState('');
  const [approvalTanggalIzinSampai, setApprovalTanggalIzinSampai] = useState('');
  const [approvalJamKeluar, setApprovalJamKeluar] = useState('');
  const [approvalJamHarusKembali, setApprovalJamHarusKembali] = useState('');

  // Form states for new exit request
  const [targetPejuangId, setTargetPejuangId] = useState(currentUser.id);
  const [alasan, setAlasan] = useState('');
  const [tanggalKeluar, setTanggalKeluar] = useState(getLocalDateString());
  const [tanggalIzinSampai, setTanggalIzinSampai] = useState(getLocalDateString());
  const [jamKeluar, setJamKeluar] = useState('08:00');
  const [jamHarusKembali, setJamHarusKembali] = useState('12:00');

  // Return log states
  const [tanggalKembaliReal, setTanggalKembaliReal] = useState(getLocalDateString());
  const [jamKembaliReal, setJamKembaliReal] = useState('12:30');

  // Filtered records
  const filteredRecords = exitPermissions.filter((rec) => {
    // If pejuang role, show only own records unless admin
    const matchesUser =
      currentUser.role === 'Admin' || rec.pejuangId === currentUser.id;
    const matchesSearch =
      rec.pejuangName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.alasan?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'Semua' || rec.status === statusFilter;
    return matchesUser && matchesSearch && matchesStatus;
  });

  const pejuangAccounts = accounts.filter((a) => a.role === 'Pejuang');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = accounts.find((a) => a.id === targetPejuangId) || currentUser;

    const newRecord: ExitPermissionRecord = {
      id: `exit-${Date.now()}`,
      pejuangId: targetUser.id,
      pejuangName: targetUser.name,
      subDivisi: targetUser.subDivisi,
      alasan,
      tanggalKeluar,
      tanggalIzinSampai,
      jamKeluar,
      jamHarusKembali,
      status: 'Menunggu Persetujuan',
    };

    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    onSaveExitPermissions([newRecord, ...exitPermissions]);
    setShowModal(false);
    setAlasan('');
  };

  const handleLogReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForReturn) return;

    // Calculate tardiness
    const dueDateTime = new Date(
      `${selectedRecordForReturn.tanggalIzinSampai}T${selectedRecordForReturn.jamHarusKembali}`
    );
    const realDateTime = new Date(`${tanggalKembaliReal}T${jamKembaliReal}`);

    let tardinessText = 'Tepat Waktu';
    let status: ExitPermissionRecord['status'] = 'Kembali Tepat Waktu';

    const diffMs = realDateTime.getTime() - dueDateTime.getTime();
    if (diffMs > 0) {
      status = 'Terlambat';
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      tardinessText = hours > 0 ? `${hours} Jam ${mins} Menit` : `${mins} Menit`;
    }

    const updated = exitPermissions.map((rec) => {
      if (rec.id === selectedRecordForReturn.id) {
        return {
          ...rec,
          tanggalKembaliReal,
          jamKembaliReal,
          status,
          keteranganKeterlambatan: tardinessText,
        };
      }
      return rec;
    });

    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    onSaveExitPermissions(updated);
    setSelectedRecordForReturn(null);
  };

    const handleSaveToDrive = async (rec: ExitPermissionRecord) => {
    if (!suratIzinTemplateUrl) {
      alert("Template Surat Izin belum diunggah. Silakan hubungi Admin.");
      return;
    }
    
    // Copy the PDF generation logic
    const doc = new jsPDF('p', 'mm', 'a5');
    doc.addImage(suratIzinTemplateUrl, 'JPEG', 0, 0, 148, 210);
    doc.setFontSize(10);
    const startX = 48;
    doc.text(rec.pejuangName, startX, 53.0);
    doc.text(rec.subDivisi || '-', startX, 60.0);
    const hajatSplit = doc.splitTextToSize(rec.alasan, 85);
    doc.text(hajatSplit[0], startX, 67.0);
    doc.text(`${rec.tanggalKeluar} / ${rec.jamKeluar}`, startX, 74.0);
    doc.text(`${rec.tanggalIzinSampai} / ${rec.jamHarusKembali}`, startX, 81.0);
    
    const printAtasanName = kepalaPondokName || 'Ust M Hamdani, B.Sc';
    doc.setFontSize(9);
    doc.text(doc.splitTextToSize(printAtasanName, 40), 37, 144.5, { align: 'center' });
    doc.text(doc.splitTextToSize(rec.pejuangName, 40), 111, 144.5, { align: 'center' });
    
    const pdfBlob = doc.output('blob');
    const filename = `Surat_Izin_Keluar_${rec.pejuangName.replace(/\s+/g, '_')}_${rec.tanggalKeluar}.pdf`;
    
    try {
      if (confirm(`Apakah Anda ingin menyimpan "${filename}" ke Google Drive Anda?`)) {
        alert("Sedang mengunggah ke Google Drive... Mohon tunggu.");
        const fileId = await uploadPDFToDrive(pdfBlob, filename);
        alert(`Berhasil disimpan ke Google Drive dengan ID: ${fileId}`);
      }
    } catch (err: any) {
      alert('Gagal menyimpan ke Google Drive: ' + err.message);
    }
  };

  const handleGeneratePDF = async (rec: ExitPermissionRecord) => {
    if (!suratIzinTemplateUrl) {
      alert("Template Surat Izin belum diunggah. Silakan hubungi Admin untuk mengunggahnya di Pengaturan (Data Profil Sistem).");
      return;
    }
    const doc = new jsPDF('p', 'mm', 'a5');
    
    // Background template
    doc.addImage(suratIzinTemplateUrl, 'JPEG', 0, 0, 148, 210);

    doc.setFontSize(10);
    
    // Fixed coordinates based on A5 template image
    const startX = 48; // Shifted slightly right to align perfectly on the dots
    
    // Shifted Y up by 7 units based on visual offset
    doc.text(rec.pejuangName, startX, 53.0);
    doc.text(rec.subDivisi || '-', startX, 60.0);
    
    // Truncate hajat if it's too long so it doesn't break the template lines
    const hajatSplit = doc.splitTextToSize(rec.alasan, 85);
    doc.text(hajatSplit[0], startX, 67.0);
    
    doc.text(`${rec.tanggalKeluar} / ${rec.jamKeluar}`, startX, 74.0);
    doc.text(`${rec.tanggalIzinSampai} / ${rec.jamHarusKembali}`, startX, 81.0);

    // Place date strings over the dots for Hijri and Masehi
    const today = new Date();
    
    // Formatters for Day and Month only (since year is part of the template: 144... H / 202... M)
    const hijriFormatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { day: 'numeric', month: 'long' });
    const masehiFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' });
    
    const tglHijriah = hijriFormatter.format(today);
    const tglMasehi = masehiFormatter.format(today);
    
    // Get exact years to extract the last digits for the "..." in the template
    const yearMasehiStr = today.getFullYear().toString();
    const lastDigitMasehi = yearMasehiStr.slice(-1); 
    
    const hijriYearParts = new Intl.DateTimeFormat('en-US-u-ca-islamic', { year: 'numeric' }).formatToParts(today);
    const hijriYearMatch = hijriYearParts.find(p => p.type === 'year')?.value || "";
    const hijriYearNum = hijriYearMatch.replace(/\D/g, ''); 
    const lastDigitHijri = hijriYearNum ? hijriYearNum.slice(-1) : "";

    // Positioned slightly right (X: 90) and Y adjusted to match the 2 lines
    doc.text(tglHijriah, 90, 98.0); 
    doc.text(tglMasehi, 90, 105.0); 
    
    // Fill in the year blanks "144... H" and "202... M" (Approximate X: 131)
    if (lastDigitHijri) doc.text(lastDigitHijri, 127, 98.0);
    if (lastDigitMasehi) doc.text(lastDigitMasehi, 127, 105.0); 

    // Generate QR Codes
    try {
      const qrSize = 20;
      
      // 1. Kadiv / Atasan QR Code (Left side)
      const atasanName = kepalaPondokName || 'Ust M Hamdani, B.Sc';
      const signatureTime = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const kadivQrData = `Telah ditandatangani oleh Kepala Pondok Pesantren Al-Bahjah Cabang Cirebon 1 ${atasanName} pada tanggal ${tglMasehi}`;
      const kadivQrDataUrl = await QRCode.toDataURL(kadivQrData, { width: 120, margin: 1, errorCorrectionLevel: 'M' });
      
      const kadivQrX = 37 - (qrSize / 2);
      const kadivQrY = 119; 
      doc.addImage(kadivQrDataUrl, 'PNG', kadivQrX, kadivQrY, qrSize, qrSize);

      // 2. Pejuang QR Code (Right side, under "Pejuang" label / printed name)
      const pejuangQrData = `Surat Izin untuk pejuang atas nama ${rec.pejuangName}, hajat ${rec.alasan}, waktu keluar ${rec.tanggalKeluar} ${rec.jamKeluar}, waktu harus kembali ${rec.tanggalIzinSampai} ${rec.jamHarusKembali}`;
      const pejuangQrDataUrl = await QRCode.toDataURL(pejuangQrData, { width: 120, margin: 1, errorCorrectionLevel: 'M' });
      
      // Placed below the Pejuang printed name with medium spacing
      const pejuangQrX = 111 - (qrSize / 2);
      const pejuangQrY = 148; 
      doc.addImage(pejuangQrDataUrl, 'PNG', pejuangQrX, pejuangQrY, qrSize, qrSize);

    } catch (e) {
      console.error("Failed to generate QR codes", e);
    }

    // Add names to signature lines
    doc.setFontSize(9);
    // Kadiv/Atasan Name (left side)
    const printAtasanName = kepalaPondokName || 'Ust M Hamdani, B.Sc';
    const atasanSplit = doc.splitTextToSize(printAtasanName, 40);
    doc.text(atasanSplit, 37, 144.5, { align: 'center' });
    
    // Pejuang Name (right side)
    const pejuangSplit = doc.splitTextToSize(rec.pejuangName, 40);
    doc.text(pejuangSplit, 111, 144.5, { align: 'center' });

    // Print Footer (Bottom Left)
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    const printTime = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const printDate = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Check if approved
    let approvedTextY = 199;
    if (rec.approvedBy) {
      doc.text(`Disetujui oleh: ${rec.approvedBy} pada ${rec.approvedAt || printDate}`, 10, approvedTextY);
    }
    
    const footerText = `Dicetak oleh ${currentUser.name}, pada tanggal ${printDate}, pukul ${printTime}, sistem Portal Pejuang Al-Bahjah Cirebon 1`;
    doc.text(footerText, 10, 202); 
    doc.setTextColor(0, 0, 0);

    doc.save(`Surat_Izin_Keluar_${rec.pejuangName.replace(/\s+/g, '_')}_${rec.tanggalKeluar}.pdf`);
  };

  const handleOpenApprovalModal = (rec: ExitPermissionRecord) => {
    setApprovalRecord(rec);
    setApprovalTanggalKeluar(rec.tanggalKeluar);
    setApprovalTanggalIzinSampai(rec.tanggalIzinSampai);
    setApprovalJamKeluar(rec.jamKeluar);
    setApprovalJamHarusKembali(rec.jamHarusKembali);
  };

  const handleSubmitApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalRecord) return;

    const now = new Date();
    const approvedTimeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const approvedDateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
       
    const updated = exitPermissions.map(p => p.id === approvalRecord.id ? { 
      ...p, 
      status: 'Di Luar' as const, 
      tanggalKeluar: approvalTanggalKeluar,
      tanggalIzinSampai: approvalTanggalIzinSampai,
      jamKeluar: approvalJamKeluar,
      jamHarusKembali: approvalJamHarusKembali,
      approvedBy: currentUser.name,
      approvedAt: `${approvedDateStr} pukul ${approvedTimeStr}`
    } : p);
    onSaveExitPermissions(updated);
    setApprovalRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Manajemen Izin Keluar Pondok</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
            Rekap Izin Keluar Pejuang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pencatatan tanggal, jam kembali, dan perhitungan Keterlambatan Pejuang Al-Bahjah Cirebon 1
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Izin Keluar</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Cari nama pejuang atau alasan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
          {['Semua', 'Di Luar', 'Kembali Tepat Waktu', 'Terlambat'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Detailed Table */}
      <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
              <th className="py-3 px-3">Nama & Sub Divisi</th>
              <th className="py-3 px-3">Alasan Izin</th>
              <th className="py-3 px-3">Tanggal Out - In</th>
              <th className="py-3 px-3">Jam Keluar</th>
              <th className="py-3 px-3">Jam Harus Kembali</th>
              <th className="py-3 px-3">Kembali Real</th>
              <th className="py-3 px-3">Keterangan Keterlambatan</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                  Tidak ada catatan izin keluar ditemukan.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => (
                <tr
                  key={rec.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {rec.pejuangName}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {rec.subDivisi}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                    {rec.alasan}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                    <div>{rec.tanggalKeluar}</div>
                    <div className="text-[10px] text-slate-400">s/d {rec.tanggalIzinSampai}</div>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                    {rec.jamKeluar}
                  </td>
                  <td className="py-3 px-3 font-bold text-amber-600 dark:text-amber-400">
                    {rec.jamHarusKembali}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                    {rec.jamKembaliReal || '-'}
                  </td>
                  <td className="py-3 px-3">
                    {rec.keteranganKeterlambatan ? (
                      <span
                        className={`font-bold text-[11px] ${
                          rec.status === 'Terlambat'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {rec.keteranganKeterlambatan}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        rec.status === 'Di Luar'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                          : rec.status === 'Terlambat'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {rec.status === 'Menunggu Persetujuan' && (currentUser.role === 'Admin' || izinKeluarApprovers.includes(currentUser.id)) && (
                        <button
                          onClick={() => handleOpenApprovalModal(rec)}
                          className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition-colors shadow-sm"
                        >
                          Approve
                        </button>
                      )}
                      
                      {rec.status !== 'Menunggu Persetujuan' && (
                        <button
                          onClick={() => handleGeneratePDF(rec)}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-sm"
                          title="Cetak Surat Izin"
                        >
                          Cetak Surat
                        </button>
                      )}
                      
                      {rec.status === 'Di Luar' && (currentUser.role === 'Admin' || rec.pejuangId === currentUser.id) && (
                        <button
                          onClick={() => setSelectedRecordForReturn(rec)}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-sm"
                        >
                          Catat Kembali
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add Exit Permission Request */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Pengajuan Izin Keluar Pondok</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 my-4">
              {currentUser.role === 'Admin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pilih Pejuang
                  </label>
                  <select
                    value={targetPejuangId}
                    onChange={(e) => setTargetPejuangId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    {pejuangAccounts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.subDivisi})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alasan Izin Keluar
                </label>
                <textarea
                  required
                  rows={2}
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  placeholder="Contoh: Mengurus keperluan medis / administratif..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Keluar Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalKeluar}
                    onChange={(e) => setTanggalKeluar(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Izin Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalIzinSampai}
                    onChange={(e) => setTanggalIzinSampai(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jam Keluar
                  </label>
                  <input
                    type="time"
                    required
                    value={jamKeluar}
                    onChange={(e) => setJamKeluar(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jam Harus Kembali
                  </label>
                  <input
                    type="time"
                    required
                    value={jamHarusKembali}
                    onChange={(e) => setJamHarusKembali(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Simpan & Terbitkan Izin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Record Return Time */}
      {selectedRecordForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">
                Catat Tanggal & Jam Kembali Ke Pondok
              </h3>
              <button
                onClick={() => setSelectedRecordForReturn(null)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="p-3 my-3 rounded-2xl bg-slate-800/80 text-xs space-y-1 border border-slate-700">
              <div className="font-bold text-emerald-400">
                {selectedRecordForReturn.pejuangName}
              </div>
              <div className="text-slate-300">
                Jam Harus Kembali: {selectedRecordForReturn.jamHarusKembali} ({selectedRecordForReturn.tanggalIzinSampai})
              </div>
            </div>

            <form onSubmit={handleLogReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tanggal Kembali Real
                </label>
                <input
                  type="date"
                  required
                  value={tanggalKembaliReal}
                  onChange={(e) => setTanggalKembaliReal(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jam Kembali Real
                </label>
                <input
                  type="time"
                  required
                  value={jamKembaliReal}
                  onChange={(e) => setJamKembaliReal(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Konfirmasi Kembali & Hitung Keterlambatan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Approve Exit Permission */}
      {approvalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>Persetujuan Izin Keluar</span>
              </h3>
              <button
                type="button"
                onClick={() => setApprovalRecord(null)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitApproval} className="space-y-4">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-300">
                <span className="block font-bold text-slate-100 mb-1">Alasan Izin:</span>
                {approvalRecord.alasan}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Keluar
                  </label>
                  <input
                    type="date"
                    required
                    value={approvalTanggalKeluar}
                    onChange={(e) => setApprovalTanggalKeluar(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Kembali
                  </label>
                  <input
                    type="date"
                    required
                    value={approvalTanggalIzinSampai}
                    onChange={(e) => setApprovalTanggalIzinSampai(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jam Keluar
                  </label>
                  <input
                    type="time"
                    required
                    value={approvalJamKeluar}
                    onChange={(e) => setApprovalJamKeluar(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jam Harus Kembali
                  </label>
                  <input
                    type="time"
                    required
                    value={approvalJamHarusKembali}
                    onChange={(e) => setApprovalJamHarusKembali(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Setujui & Simpan
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
