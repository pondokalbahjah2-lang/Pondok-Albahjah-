import { getLocalDateString } from '../utils/dateUtils';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  FileCheck,
} from 'lucide-react';
import { UserAccount, LeaveRequestRecord } from '../types';

interface CutiViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  leaveRequests: LeaveRequestRecord[];
  onSaveLeaveRequests: (records: LeaveRequestRecord[]) => void;
  suratCutiTemplateUrl?: string;
  kepalaPondokName?: string;
  appLogoUrl?: string;
  cutiApprovers?: string[];
  jenisCutiList?: { id: string; name: string; maxDays: number; }[];
  onSaveAccounts?: (accounts: UserAccount[]) => void;
}

const DEFAULT_JENIS_CUTI = [
  { id: '1', name: 'Cuti Menikah', maxDays: 7 },
  { id: '2', name: 'Cuti Menikahkan Anak', maxDays: 3 },
  { id: '3', name: 'Cuti Khitanan Anak', maxDays: 3 },
  { id: '4', name: 'Cuti Melahirkan', maxDays: 90 },
  { id: '5', name: 'Cuti Istri Melahirkan', maxDays: 3 },
  { id: '6', name: 'Cuti Keluarga Inti Meninggal', maxDays: 7 },
  { id: '7', name: 'Cuti Tahunan', maxDays: 12 }
];

export const CutiView: React.FC<CutiViewProps> = ({
  currentUser,
  accounts,
  leaveRequests,
  onSaveLeaveRequests,
  suratCutiTemplateUrl,
  kepalaPondokName,
  appLogoUrl,
  cutiApprovers = [],
  jenisCutiList = DEFAULT_JENIS_CUTI,
  onSaveAccounts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [targetPejuangId, setTargetPejuangId] = useState(currentUser.id);
  const [nipy, setNipy] = useState('');
  const [jenisCuti, setJenisCuti] = useState(jenisCutiList[0]?.name || 'Cuti Tahunan');
  const [alasan, setAlasan] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState(getLocalDateString());
  const [tanggalSelesai, setTanggalSelesai] = useState(getLocalDateString());
  const [durasiCutiTahunan, setDurasiCutiTahunan] = useState(1);

  const pejuangAccounts = accounts.filter((a) => a.role === 'Pejuang');

  const getSisaCutiTahunan = (pId: string) => {
    const currentYearStr = new Date().getFullYear().toString();
    const used = leaveRequests
      .filter(l => l.pejuangId === pId && l.jenisCuti === 'Cuti Tahunan' && (l.status === 'Disetujui' || l.status === 'Menunggu Persetujuan') && l.tanggalMulai.startsWith(currentYearStr))
      .reduce((acc, curr) => acc + curr.totalHari, 0);
    return Math.max(0, 12 - used);
  };

  useEffect(() => {
    const user = accounts.find(a => a.id === targetPejuangId);
    if (user) {
      setNipy(user.nipy || '');
    }
  }, [targetPejuangId, accounts]);

  useEffect(() => {
    if (tanggalMulai && jenisCuti && showAddModal) {
      if (jenisCuti === 'Cuti Tahunan') {
        const start = new Date(tanggalMulai);
        start.setDate(start.getDate() + (durasiCutiTahunan - 1));
        setTanggalSelesai(getLocalDateString(start));
      } else {
        const selectedJenis = jenisCutiList.find(j => j.name === jenisCuti);
        const max = selectedJenis?.maxDays || 1;
        const start = new Date(tanggalMulai);
        start.setDate(start.getDate() + (max - 1));
        setTanggalSelesai(getLocalDateString(start));
      }
    }
  }, [tanggalMulai, jenisCuti, jenisCutiList, showAddModal, durasiCutiTahunan]);

  // Filtered requests
  const filteredRequests = leaveRequests.filter((l) => {
    const matchesUser =
      currentUser.role === 'Admin' || l.pejuangId === currentUser.id;
    const matchesSearch =
      l.pejuangName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.alasan?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'Semua' || l.status === statusFilter;
    return matchesUser && matchesSearch && matchesStatus;
  });

  const handleCreateLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = accounts.find((a) => a.id === targetPejuangId) || currentUser;

    const start = new Date(tanggalMulai);
    const end = new Date(tanggalSelesai);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const totalHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check Cuti Tahunan rules
    if (jenisCuti === 'Cuti Tahunan') {
      if (totalHari > 4 && currentUser.role !== 'Admin') {
        alert('Maksimal pengambilan cuti tahunan dalam satu kali pengajuan adalah 4 hari.');
        return;
      }
      const sisa = getSisaCutiTahunan(targetUser.id);
      if (totalHari > sisa) {
        alert(`Sisa cuti tahunan hanya ${sisa} hari. Tidak dapat mengajukan ${totalHari} hari.`);
        return;
      }
    }

    const selectedJenis = jenisCutiList.find(j => j.name === jenisCuti);
    if (selectedJenis && totalHari > selectedJenis.maxDays) {
      alert(`Maksimal durasi untuk ${jenisCuti} adalah ${selectedJenis.maxDays} hari.`);
      return;
    }

    const newRecord: LeaveRequestRecord = {
      id: `leave-${Date.now()}`,
      pejuangId: targetUser.id,
      pejuangName: targetUser.name,
      nipy: nipy || '-',
      subDivisi: targetUser.subDivisi,
      jenisCuti,
      alasan,
      tanggalMulai,
      tanggalSelesai,
      totalHari,
      status: 'Menunggu Persetujuan',
      tanggalPengajuan: getLocalDateString(new Date()),
    };

    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    onSaveLeaveRequests([newRecord, ...leaveRequests]);
    
    // Auto-update NIPY
    if (nipy && targetUser.nipy !== nipy) {
      if (onSaveAccounts) {
        const updatedAccounts = accounts.map(a => a.id === targetUser.id ? { ...a, nipy } : a);
        onSaveAccounts(updatedAccounts);
      }
    }
    setShowAddModal(false);
    setAlasan('');
    alert('Pengajuan cuti berhasil dikirim dan menunggu persetujuan.');
  };

  const handleApproveReject = (
    id: string,
    newStatus: 'Disetujui' | 'Ditolak' | 'Sedang Cuti'
  ) => {
    const updated = leaveRequests.map((l) => {
      if (l.id === id) {
        const now = new Date();
        const approvedTimeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const approvedDateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        return {
          ...l,
          status: newStatus,
          approvedBy: currentUser.name,
          approvedAt: `${approvedDateStr} pukul ${approvedTimeStr}`,
          catatanAdmin: `Diverifikasi oleh ${currentUser.name} pada ${new Date().toLocaleDateString('id-ID')}`,
        };
      }
      return l;
    });
    onSaveLeaveRequests(updated);
  };

  const handleGenerateCetakPDF = async (rec: LeaveRequestRecord) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });

      if (suratCutiTemplateUrl) {
        doc.addImage(suratCutiTemplateUrl, 'JPEG', 0, 0, 148, 210);
      } else {
        doc.setFontSize(14);
        doc.text("SURAT IZIN CUTI", 74, 20, { align: 'center' });
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);

      
                        // We'll fill exactly where the OCR blank spots are
      const startX = 56;
      doc.text(rec.pejuangName, startX, 50.5);
      doc.text(rec.nipy || '-', startX, 56.75);
      doc.text(rec.subDivisi, startX, 63);
      doc.text(rec.jenisCuti, startX, 68.5);
      
      const alasanSplit = doc.splitTextToSize(rec.alasan, 80);
      doc.text(alasanSplit[0], startX, 74.25);
      
      doc.text(rec.tanggalMulai, startX, 78.5);
      doc.text(rec.tanggalSelesai, startX, 84);

      // Generate Hijriah date approximate
      const today = new Date();
      const printTime = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      const hijriFormatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { day: 'numeric', month: 'long' });
      const masehiFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' });
      
      const tglHijriah = hijriFormatter.format(today);
      const tglMasehi = masehiFormatter.format(today);
      
      const yearMasehiStr = today.getFullYear().toString();
      const lastDigitMasehi = yearMasehiStr.slice(-1); 
      
      const hijriYearParts = new Intl.DateTimeFormat('en-US-u-ca-islamic', { year: 'numeric' }).formatToParts(today);
      const hijriYearMatch = hijriYearParts.find(p => p.type === 'year')?.value || "";
      const hijriYearNum = hijriYearMatch.replace(/\D/g, ''); 
      const lastDigitHijri = hijriYearNum ? hijriYearNum.slice(-1) : "";

      // Position dates over the Cirebon template lines
      doc.text(tglHijriah, 93, 101.75); 
      doc.text(tglMasehi, 93, 108); 
      
      // Fill in the year blanks "144... H" and "202... M" (Approximate X: 134)
      if (lastDigitHijri) doc.text(lastDigitHijri, 131, 101.75);
      if (lastDigitMasehi) doc.text(lastDigitMasehi, 131, 108);

      // Generate QR Codes
      const qrSize = 20;

      // 1. Kadiv / Atasan (Kiri) - QR di atas kurung
      const atasanName = kepalaPondokName || 'Ust M Hamdani, B.Sc';
      const printDate = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const kadivQrData = `Telah disetujui (Cuti) oleh ${rec.approvedBy ? rec.approvedBy : atasanName} pada ${rec.approvedAt || printDate}`;
      const kadivQrDataUrl = await QRCode.toDataURL(kadivQrData, { width: 120, margin: 1, errorCorrectionLevel: 'M' });
      const kadivQrX = 74 - (qrSize / 2); // Tengah (Kadiv)
      const kadivQrY = 126; 
      doc.addImage(kadivQrDataUrl, 'PNG', kadivQrX, kadivQrY, qrSize, qrSize);

      // 2. Pejuang (Kanan) - QR di bawah nama (nama di bawah kurung)
      const pejuangQrData = `Surat Cuti untuk ${rec.pejuangName} (${rec.jenisCuti}), mulai ${rec.tanggalMulai} sampai ${rec.tanggalSelesai}`;
      const pejuangQrDataUrl = await QRCode.toDataURL(pejuangQrData, { width: 120, margin: 1, errorCorrectionLevel: 'M' });
      const pejuangQrX = 114 - (qrSize / 2); // Kanan (Pejuang)
      const pejuangQrY = 162; // QR diletakkan di bawah nama pejuang
      doc.addImage(pejuangQrDataUrl, 'PNG', pejuangQrX, pejuangQrY, qrSize, qrSize);

      // Signature names (Ditaruh di bawah kurung)
      doc.setFontSize(9);
      const printAtasanName = kepalaPondokName || 'Ust M Hamdani, B.Sc';
      // Posisi nama di bawah kurung tanda tangan (Y=151)
      doc.text(doc.splitTextToSize(printAtasanName, 40), 74, 152.5, { align: 'center' }); // Kadiv Name
      doc.text(doc.splitTextToSize(rec.pejuangName, 40), 114, 152.5, { align: 'center' }); // Pejuang Name

      // Footer
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      let approvedTextY = 199;
      if (rec.approvedBy) {
        doc.text(`Disetujui oleh: ${rec.approvedBy} pada ${rec.approvedAt || printDate}`, 10, approvedTextY);
      }
      const footerText = `Dicetak oleh ${currentUser.name}, pada tanggal ${printDate}, pukul ${printTime}, sistem Portal Pejuang Al-Bahjah Cirebon 1`;
      doc.text(footerText, 10, 202); 
      doc.setTextColor(0, 0, 0);

      const filename = `Surat_Cuti_${rec.pejuangName.replace(/s+/g, '_')}_${rec.tanggalMulai}.pdf`;
      doc.save(filename);
      alert('Surat Cuti berhasil diunduh sebagai PDF.');
    } catch (err) {
      console.error('Failed to generate cuti PDF', err);
      alert('Gagal mencetak PDF. ' + String(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Manajemen Cuti & Izin Berhari</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Pengajuan Permohonan Cuti
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="py-3 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 flex items-center space-x-2 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengajuan Cuti Baru</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari nama pejuang atau alasan cuti..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none text-slate-700 dark:text-slate-200"
          />
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {(currentUser.role === 'Admin' ? ['Semua', 'Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Sedang Cuti', 'Selesai', 'Rekap Kuota Cuti'] : ['Semua', 'Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Sedang Cuti', 'Selesai']).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Requests Table */}
      
      {statusFilter === 'Rekap Kuota Cuti' ? (
        <div className="bg-white/70 dark:bg-slate-900/60 rounded-3xl border border-white/60 dark:border-white/10 shadow-xl overflow-hidden p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Rekap & Input Manual Cuti Tahunan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Nama Pejuang</th>
                  <th className="py-3 px-3">Sub Divisi</th>
                  <th className="py-3 px-3">Kuota Terpakai</th>
                  <th className="py-3 px-3">Sisa Kuota</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {accounts.filter(a => a.role === 'Pejuang').map(p => {
                  const sisa = getSisaCutiTahunan(p.id);
                  const maxCuti = 12;
                  const terpakai = maxCuti - sisa;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-xs text-slate-800 dark:text-slate-200">{p.name}</td>
                      <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400">{p.subDivisi}</td>
                      <td className="py-3 px-3 text-xs text-amber-600 font-bold">{terpakai} Hari</td>
                      <td className="py-3 px-3 text-xs text-emerald-600 font-bold">{sisa} Hari</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setTargetPejuangId(p.id);
                            setJenisCuti('Cuti Tahunan');
                            setShowAddModal(true);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold text-[10px] transition-colors"
                        >
                          Input Manual Cuti
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
<div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
              <th className="py-3 px-3">Nama Pejuang & NIPY</th>
              <th className="py-3 px-3">Jenis & Alasan Cuti</th>
              <th className="py-3 px-3">Tanggal Mulai - Selesai</th>
              <th className="py-3 px-3">Durasi</th>
              <th className="py-3 px-3 text-center">Status Cuti</th>
              <th className="py-3 px-3 text-right">Aksi & Persetujuan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                  Belum ada permohonan cuti ditemukan.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{req.pejuangName}</div>
                    <div className="text-[10px] text-slate-500">NIPY: {req.nipy}</div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{req.subDivisi}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] inline-block mb-1">
                      {req.jenisCuti}
                    </span>
                    <div className="text-slate-700 dark:text-slate-300 max-w-[200px] leading-tight text-xs">
                      {req.alasan}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                    {req.tanggalMulai} s/d {req.tanggalSelesai}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                    {req.totalHari} Hari
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${
                        req.status === 'Menunggu Persetujuan'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                          : req.status === 'Disetujui' || req.status === 'Sedang Cuti'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {req.status === 'Menunggu Persetujuan' && (currentUser.role === 'Admin' || cutiApprovers.includes(currentUser.id)) && (
                        <>
                          <button
                            onClick={() => handleApproveReject(req.id, 'Disetujui')}
                            className="py-1 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] transition-colors shadow-sm flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => handleApproveReject(req.id, 'Ditolak')}
                            className="py-1 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors shadow-sm flex items-center space-x-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Tolak</span>
                          </button>
                        </>
                      )}
                      
                      {req.status === 'Disetujui' && (currentUser.role === 'Admin' || req.pejuangId === currentUser.id) && (
                        <button
                          onClick={() => handleGenerateCetakPDF(req)}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-sm"
                          title="Cetak Surat Cuti"
                        >
                          Cetak Surat
                        </button>
                      )}
                      {req.status !== 'Menunggu Persetujuan' && req.status !== 'Disetujui' && (
                        <span className="text-[11px] text-slate-400 italic">
                          {req.catatanAdmin || 'Selesai'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      )}

      {/* Modal Add Leave Request */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Pengajuan Permohonan Cuti Pejuang</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateLeaveRequest} className="space-y-4">
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

              {jenisCuti === 'Cuti Tahunan' && (
                <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-200">Sisa Cuti Tahunan:</span>
                  <span className="text-sm font-bold text-amber-400">{getSisaCutiTahunan(targetPejuangId)} Hari</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NIPY
                  </label>
                  <input
                    type="text"
                    required
                    value={nipy}
                    onChange={(e) => setNipy(e.target.value)}
                    placeholder="Nomor NIPY"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Divisi / Area Tugas
                  </label>
                  <input
                    type="text"
                    disabled
                    value={accounts.find((a) => a.id === targetPejuangId)?.subDivisi || currentUser.subDivisi}
                    className="w-full p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jenis Cuti
                </label>
                <select
                  value={jenisCuti}
                  onChange={(e) => setJenisCuti(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  {jenisCutiList.map((j) => (
                    <option key={j.id || j.name} value={j.name}>
                      {j.name} (Maks: {j.maxDays} Hari)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alasan Permohonan Cuti
                </label>
                <textarea
                  required
                  rows={2}
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  placeholder="Deskripsikan lebih detail alasan cuti..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Awal Cuti
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                {jenisCuti === 'Cuti Tahunan' && currentUser.role !== 'Admin' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Durasi (1-4 Hari)
                    </label>
                    <select
                      value={durasiCutiTahunan}
                      onChange={(e) => setDurasiCutiTahunan(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value={1}>1 Hari</option>
                      <option value={2}>2 Hari</option>
                      <option value={3}>3 Hari</option>
                      <option value={4}>4 Hari</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tanggal Kembali Cuti
                    </label>
                    <input
                      type="date"
                      required
                      value={tanggalSelesai}
                      onChange={(e) => setTanggalSelesai(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full py-3 mt-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Kirimkan Permohonan Cuti
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
