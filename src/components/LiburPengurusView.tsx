import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarOff,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  FileText,
  UserCheck,
  Building2,
  Calendar,
  AlertCircle,
  Eye,
  Filter,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import {
  UserAccount,
  LiburPengurusRecord,
  SUB_DIVISI_LIBUR_PENGURUS,
  AttendanceRecord
} from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { triggerHapticFeedback, HAPTIC_PATTERNS } from '../utils/vibration';

interface LiburPengurusViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  liburPengurusList: LiburPengurusRecord[];
  onSaveLiburPengurus: (records: LiburPengurusRecord[]) => void;
  onSaveAttendance?: (records: AttendanceRecord[]) => void;
  attendance?: AttendanceRecord[];
  kepalaPondokName?: string;
  appLogoUrl?: string;
  liburApprovers?: string[];
  dynamicDivisions?: string[];
}

export const LiburPengurusView: React.FC<LiburPengurusViewProps> = ({
  currentUser,
  accounts,
  liburPengurusList = [],
  onSaveLiburPengurus,
  onSaveAttendance,
  attendance = [],
  kepalaPondokName = 'Ust M Hamdani, B.Sc',
  appLogoUrl,
  liburApprovers = [],
  dynamicDivisions = []
}) => {
  const isAdmin = currentUser.role === 'Admin';

  // Check if current user is an approver for a specific record or division
  const isApprover = (recSubDivisi?: string) => {
    if (isAdmin) return true;
    if (liburApprovers.includes(currentUser.id) || liburApprovers.includes(currentUser.name)) return true;
    const isLeader = Boolean((currentUser.amanah || '').toLowerCase().match(/ketua|kepala|manajer|manager|koordinator/));
    if (!isLeader) return false;
    if (!currentUser.subDivisi) return true;
    const norm = (s?: string) => (s || '').toLowerCase().replace(/^(divisi|sub\s*divisi|unit)\s+/i, '').trim();
    return norm(currentUser.subDivisi) === norm(recSubDivisi);
  };

  // Sub-division eligibility check
  const isEligibleSubDivisi = (subDiv?: string) => {
    if (!subDiv) return false;
    const s = subDiv.toLowerCase().trim();
    return (
      s.includes('sdiqu') ||
      s.includes('smpiqu') ||
      s.includes('smaiqu') ||
      s.includes('banat') ||
      SUB_DIVISI_LIBUR_PENGURUS.some(unit => s === unit.toLowerCase().trim())
    );
  };

  const userCanApply = isAdmin || isEligibleSubDivisi(currentUser.subDivisi);

  // States
  const [activeTab, setActiveTab] = useState<'Semua' | 'Menunggu' | 'Disetujui' | 'Ditolak'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivisi, setFilterDivisi] = useState<string>('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<LiburPengurusRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [targetPejuangId, setTargetPejuangId] = useState<string>(currentUser.id);
  const [tanggalMulai, setTanggalMulai] = useState<string>(getLocalDateString(new Date()));
  const [tanggalSelesai, setTanggalSelesai] = useState<string>(getLocalDateString(new Date()));
  const [alasan, setAlasan] = useState<string>('');
  const [badalId, setBadalId] = useState<string>('');
  const [badalSearch, setBadalSearch] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Target pejuang info
  const targetUser = useMemo(() => {
    return accounts.find(a => a.id === targetPejuangId) || currentUser;
  }, [accounts, targetPejuangId, currentUser]);

  // Badal user info
  const badalUser = useMemo(() => {
    return accounts.find(a => a.id === badalId);
  }, [accounts, badalId]);

  // Candidates for Badal (active pejuang, excluding target pejuang)
  const badalCandidates = useMemo(() => {
    return accounts.filter(a => {
      if (a.id === targetUser.id) return false;
      if (!badalSearch.trim()) return true;
      const q = badalSearch.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        (a.amanah || '').toLowerCase().includes(q) ||
        (a.subDivisi || '').toLowerCase().includes(q)
      );
    });
  }, [accounts, targetUser.id, badalSearch]);

  // Eligible Pejuang list for Admin to submit on behalf
  const eligiblePejuangList = useMemo(() => {
    return accounts.filter(a => a.role === 'Pejuang' && (isAdmin || isEligibleSubDivisi(a.subDivisi)));
  }, [accounts, isAdmin]);

  // Calculate total days
  const calculatedTotalHari = useMemo(() => {
    if (!tanggalMulai || !tanggalSelesai) return 0;
    const start = new Date(tanggalMulai);
    const end = new Date(tanggalSelesai);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [tanggalMulai, tanggalSelesai]);

  // Filtered list
  const filteredList = useMemo(() => {
    return liburPengurusList.filter(item => {
      // Permission check: Pejuang only sees their own or where they are badal, unless they are approver
      if (!isAdmin && !isApprover(item.subDivisi)) {
        if (item.pejuangId !== currentUser.id && item.badalId !== currentUser.id) {
          return false;
        }
      }

      // Tab filter
      if (activeTab === 'Menunggu' && item.status !== 'Menunggu Persetujuan') return false;
      if (activeTab === 'Disetujui' && item.status !== 'Disetujui' && item.status !== 'Sedang Libur' && item.status !== 'Selesai') return false;
      if (activeTab === 'Ditolak' && item.status !== 'Ditolak') return false;

      // Division filter
      if (filterDivisi !== 'Semua' && item.subDivisi !== filterDivisi) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.pejuangName.toLowerCase().includes(q);
        const matchAmanah = (item.amanah || '').toLowerCase().includes(q);
        const matchBadal = (item.badalName || '').toLowerCase().includes(q);
        const matchDivisi = (item.subDivisi || '').toLowerCase().includes(q);
        if (!matchName && !matchAmanah && !matchBadal && !matchDivisi) return false;
      }

      return true;
    });
  }, [liburPengurusList, isAdmin, currentUser.id, activeTab, filterDivisi, searchQuery]);

  // Summary statistics
  const stats = useMemo(() => {
    const list = liburPengurusList.filter(item => {
      if (isAdmin || isApprover(item.subDivisi)) return true;
      return item.pejuangId === currentUser.id || item.badalId === currentUser.id;
    });

    const pending = list.filter(i => i.status === 'Menunggu Persetujuan').length;
    const approved = list.filter(i => i.status === 'Disetujui').length;
    const active = list.filter(i => {
      if (i.status !== 'Disetujui' && i.status !== 'Sedang Libur') return false;
      const today = getLocalDateString(new Date());
      return i.tanggalMulai <= today && today <= i.tanggalSelesai;
    }).length;

    return { total: list.length, pending, approved, active };
  }, [liburPengurusList, isAdmin, currentUser.id]);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!tanggalMulai || !tanggalSelesai) {
      setFormError('Tanggal Mulai dan Tanggal Selesai wajib diisi.');
      return;
    }

    if (calculatedTotalHari <= 0) {
      setFormError('Tanggal Selesai harus sama dengan atau setelah Tanggal Mulai.');
      return;
    }

    if (!badalId || !badalUser) {
      setFormError('Pemegang Tanggung Jawab Sementara (Badal) wajib dipilih.');
      return;
    }

    if (badalId === targetUser.id) {
      setFormError('Badal tidak boleh diri sendiri.');
      return;
    }

    // Overlap validation
    const hasOverlap = liburPengurusList.some(item => {
      if (item.pejuangId !== targetUser.id) return false;
      if (item.status === 'Ditolak') return false;
      // Date overlap condition: max(startA, startB) <= min(endA, endB)
      return !(tanggalSelesai < item.tanggalMulai || tanggalMulai > item.tanggalSelesai);
    });

    if (hasOverlap) {
      setFormError('Terdapat jadwal izin libur lain yang bentrok dengan rentang tanggal ini.');
      return;
    }

    setIsSubmitting(true);
    triggerHapticFeedback(HAPTIC_PATTERNS.SUBMIT_CUTI);

    const newRecord: LiburPengurusRecord = {
      id: `libur-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      pejuangId: targetUser.id,
      pejuangName: targetUser.name,
      amanah: targetUser.amanah || 'Pengurus Unit',
      subDivisi: targetUser.subDivisi || 'Pondok Pesantren Unit SDIQu',
      tanggalMulai,
      tanggalSelesai,
      totalHari: calculatedTotalHari,
      alasan: alasan.trim() || 'Permohonan Libur Pengurus',
      badalId: badalUser.id,
      badalName: badalUser.name,
      badalAmanah: badalUser.amanah || 'Pejuang',
      status: 'Menunggu Persetujuan',
      tanggalPengajuan: getLocalDateString(new Date()),
      history: [
        {
          status: 'Diajukan',
          by: currentUser.name,
          timestamp: new Date().toISOString()
        }
      ]
    };

    onSaveLiburPengurus([newRecord, ...liburPengurusList]);
    setIsSubmitting(false);
    setShowAddModal(false);
    setAlasan('');
    setBadalId('');
    setBadalSearch('');
    alert('Permohonan izin libur pengurus berhasil diajukan dan menunggu persetujuan.');
  };

  // Generate Official PDF Surat
  const handleGeneratePDF = async (rec: LiburPengurusRecord) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const today = new Date();
      const printTime = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const printDate = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      // Hijriah Date
      let tglHijriah = '';
      try {
        const hijriFormatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' });
        tglHijriah = hijriFormatter.format(today);
      } catch (e) {
        tglHijriah = '1447 H';
      }

      // 1. Kop Surat
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text('YAYASAN AL-BAHJAH', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text('PONDOK PESANTREN AL-BAHJAH CABANG CIREBON 1', 105, 27, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text('Alamat: Jl. Pangeran Cakrabuana No. 179, Sendang, Sumber, Cirebon - Jawa Barat', 105, 33, { align: 'center' });
      doc.text('Website: www.albahjah.or.id | Email: sekretariat@albahjah.or.id', 105, 37, { align: 'center' });

      // Garis Ganda Pembatas Kop
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.8);
      doc.line(20, 41, 190, 41);
      doc.setLineWidth(0.3);
      doc.line(20, 42.5, 190, 42.5);

      // 2. Judul Surat
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('SURAT PERMOHONAN LIBUR PENGURUS', 105, 52, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Nomor: ${rec.id.toUpperCase()} / PLP-AB / ${today.getFullYear()}`, 105, 57, { align: 'center' });

      // 3. Tanggal dan Tujuan
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`Cirebon, ${printDate} M / ${tglHijriah}`, 190, 67, { align: 'right' });

      doc.text('Kepada Yth.', 20, 75);
      doc.setFont('helvetica', 'bold');
      doc.text(`Kepala Pondok Pesantren Al-Bahjah Cabang Cirebon 1`, 20, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(`di Tempat`, 20, 85);

      // Salam Pembuka
      doc.setFont('helvetica', 'italic');
      doc.text("Assalamu'alaikum Warahmatullahi Wabarakatuh,", 20, 95);
      doc.setFont('helvetica', 'normal');

      // Kalimat Pengantar
      const pengantarText = `Dengan memohon ridho dan taufiq dari Allah Subhanahu Wa Ta'ala, saya yang bertanda tangan di bawah ini bermaksud mengajukan permohonan izin libur pengurus dengan rincian data sebagai berikut:`;
      const splitPengantar = doc.splitTextToSize(pengantarText, 170);
      doc.text(splitPengantar, 20, 102);

      // 4. Data Rincian (Box / Table style)
      let currentY = 114;
      const startXLabel = 25;
      const startXColon = 80;
      const startXValue = 85;
      const lineHeight = 7.5;

      const rincian = [
        { label: 'Nama Lengkap', value: rec.pejuangName },
        { label: 'Amanah / Jabatan', value: rec.amanah },
        { label: 'Sub Divisi / Unit', value: rec.subDivisi },
        { label: 'Waktu Izin Libur', value: `${rec.tanggalMulai} s/d ${rec.tanggalSelesai} (${rec.totalHari} Hari)` },
        { label: 'Keperluan / Alasan', value: rec.alasan || '-' },
        { label: 'Pemegang Tanggung Jawab (Badal)', value: `${rec.badalName} (${rec.badalAmanah})` },
        { label: 'Status Verifikasi', value: `${rec.status.toUpperCase()} ${rec.approvedBy ? `(Disetujui oleh: ${rec.approvedBy})` : ''}` }
      ];

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, currentY - 4, 170, rincian.length * lineHeight + 4, 3, 3, 'FD');

      rincian.forEach((item) => {
        doc.setFont('helvetica', 'bold');
        doc.text(item.label, startXLabel, currentY);
        doc.text(':', startXColon, currentY);
        doc.setFont('helvetica', 'normal');
        const splitVal = doc.splitTextToSize(item.value, 100);
        doc.text(splitVal[0], startXValue, currentY);
        currentY += lineHeight;
      });

      // Kalimat Penutup
      currentY += 6;
      const penutupText = `Selama masa izin libur tersebut, seluruh tugas harian dan tanggung jawab kepondokan telah dikoordinasikan dan dialihkan sementara kepada pemegang tanggung jawab sementara (Badal) yang bersangkutan.\n\nDemikian surat permohonan izin libur ini kami sampaikan dengan sebenarnya. Atas perhatian, arahan, dan persetujuan yang diberikan, kami haturkan jazakumullahu khairan katsiran.`;
      const splitPenutup = doc.splitTextToSize(penutupText, 170);
      doc.text(splitPenutup, 20, currentY);

      currentY += 28;
      doc.setFont('helvetica', 'italic');
      doc.text("Wassalamu'alaikum Warahmatullahi Wabarakatuh,", 20, currentY);

      // 5. Tanda Tangan & QR Code 3 Kolom
      currentY += 10;
      const qrSize = 18;

      // QR Code 1: Badal
      const badalQrData = `Telah bersedia menjadi Pemegang Tanggung Jawab Sementara (Badal): ${rec.badalName} untuk ${rec.pejuangName} (${rec.tanggalMulai} s/d ${rec.tanggalSelesai})`;
      const badalQrUrl = await QRCode.toDataURL(badalQrData, { width: 100, margin: 1 });

      // QR Code 2: Pemohon
      const pemohonQrData = `Permohonan Izin Libur Pengurus: ${rec.pejuangName} (${rec.amanah}) tanggal ${rec.tanggalMulai} s/d ${rec.tanggalSelesai}`;
      const pemohonQrUrl = await QRCode.toDataURL(pemohonQrData, { width: 100, margin: 1 });

      // QR Code 3: Kepala Pondok / Approver
      const approverName = rec.approvedBy || kepalaPondokName;
      const atasanQrData = `Telah disetujui secara resmi oleh Kepala Pondok: ${approverName} pada ${rec.approvedAt || printDate}`;
      const atasanQrUrl = await QRCode.toDataURL(atasanQrData, { width: 100, margin: 1 });

      const col1X = 45;  // Badal
      const col2X = 105; // Pemohon
      const col3X = 165; // Kepala Pondok

      // Label jabatan tanda tangan
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Pemegang Tanggung Jawab', col1X, currentY, { align: 'center' });
      doc.text('Sementara (Badal)', col1X, currentY + 4, { align: 'center' });

      doc.text('Pemohon Libur,', col2X, currentY + 2, { align: 'center' });

      doc.text('Menyetujui,', col3X, currentY, { align: 'center' });
      doc.text('Kepala Pondok Pesantren', col3X, currentY + 4, { align: 'center' });

      // Gambar QR Codes
      const qrY = currentY + 7;
      doc.addImage(badalQrUrl, 'PNG', col1X - (qrSize / 2), qrY, qrSize, qrSize);
      doc.addImage(pemohonQrUrl, 'PNG', col2X - (qrSize / 2), qrY, qrSize, qrSize);
      doc.addImage(atasanQrUrl, 'PNG', col3X - (qrSize / 2), qrY, qrSize, qrSize);

      // Nama di bawah QR Code
      const nameY = qrY + qrSize + 6;
      doc.setFont('helvetica', 'bold');
      doc.text(rec.badalName, col1X, nameY, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(rec.badalAmanah, col1X, nameY + 3.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(rec.pejuangName, col2X, nameY, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(rec.amanah, col2X, nameY + 3.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(approverName, col3X, nameY, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('Kepala Cabang Cirebon 1', col3X, nameY + 3.5, { align: 'center' });

      // Footer Catatan
      doc.setDrawColor(203, 213, 225);
      doc.line(20, 275, 190, 275);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Dicetak secara digital oleh sistem Portal Pejuang Al-Bahjah Cirebon 1 pada ${printDate} ${printTime} WIB`, 20, 280);
      doc.text(`ID Dokumen: ${rec.id}`, 190, 280, { align: 'right' });

      const fileName = `Surat_Libur_${rec.pejuangName.replace(/\s+/g, '_')}_${rec.tanggalMulai}.pdf`;
      doc.save(fileName);
      alert('Surat Permohonan Libur Pengurus berhasil diunduh sebagai PDF.');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Gagal membuat dokumen PDF surat.');
    }
  };

  // Approve or Reject Handler
  const handleApproveReject = (
    rec: LiburPengurusRecord,
    newStatus: 'Disetujui' | 'Ditolak',
    adminNotes?: string
  ) => {
    triggerHapticFeedback(newStatus === 'Disetujui' ? HAPTIC_PATTERNS.APPROVE : HAPTIC_PATTERNS.REJECT);

    const now = new Date();
    const approvedDateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const approvedTimeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const updatedList = liburPengurusList.map(item => {
      if (item.id === rec.id) {
        return {
          ...item,
          status: newStatus,
          approvedBy: currentUser.name,
          approvedAt: `${approvedDateStr} pukul ${approvedTimeStr} WIB`,
          catatanAdmin: adminNotes || (newStatus === 'Disetujui' ? `Disetujui oleh ${currentUser.name}` : `Ditolak oleh ${currentUser.name}`),
          history: [
            ...(item.history || []),
            {
              status: newStatus,
              by: currentUser.name,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return item;
    });

    onSaveLiburPengurus(updatedList);

    // If approved, automatically mark / sync Attendance records as 'Libur' for each day in range
    if (newStatus === 'Disetujui' && onSaveAttendance) {
      try {
        const start = new Date(rec.tanggalMulai);
        const end = new Date(rec.tanggalSelesai);
        const newAttendanceRecords: AttendanceRecord[] = [...attendance];

        const loopDate = new Date(start);
        while (loopDate <= end) {
          const dateStr = getLocalDateString(loopDate);
          const existingIdx = newAttendanceRecords.findIndex(
            a => a.pejuangId === rec.pejuangId && a.date === dateStr
          );

          const liburRecord: AttendanceRecord = {
            id: `att-libur-${rec.pejuangId}-${dateStr}`,
            pejuangId: rec.pejuangId,
            pejuangName: rec.pejuangName,
            subDivisi: rec.subDivisi,
            date: dateStr,
            time: 'Libur',
            timeMasuk: 'Libur',
            timePulang: 'Libur',
            photoUrl: '',
            latitude: 0,
            longitude: 0,
            distanceFromPondok: 0,
            status: 'Libur',
            isWithinRadius: true,
            notes: `Izin Libur Pengurus (Disetujui) - Badal: ${rec.badalName}`
          };

          if (existingIdx >= 0) {
            // If already exists and wasn't manually clocked in with photo, update to Libur
            if (!newAttendanceRecords[existingIdx].photoUrl) {
              newAttendanceRecords[existingIdx] = {
                ...newAttendanceRecords[existingIdx],
                status: 'Libur',
                notes: `Izin Libur Pengurus (Disetujui) - Badal: ${rec.badalName}`
              };
            }
          } else {
            newAttendanceRecords.push(liburRecord);
          }

          loopDate.setDate(loopDate.getDate() + 1);
        }

        onSaveAttendance(newAttendanceRecords);
      } catch (attErr) {
        console.error('Failed to auto-set attendance for libur:', attErr);
      }
    }

    setSelectedDetail(null);
    alert(`Permohonan izin libur ${rec.pejuangName} berhasil di-${newStatus.toLowerCase()}.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CalendarOff className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Izin Libur Pengurus
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Modul khusus pengajuan izin libur bagi pengurus Unit Pondok Pesantren (SDIQu, SMPIQu, SMAIQu, dan Kepondokan Banat) dengan penunjukan Badal Pemegang Tanggung Jawab Sementara serta pembuatan surat resmi ber-QR Code.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {userCanApply && (
              <button
                id="btn-tambah-libur-pengurus"
                onClick={() => {
                  setTargetPejuangId(currentUser.id);
                  setTanggalMulai(getLocalDateString(new Date()));
                  setTanggalSelesai(getLocalDateString(new Date()));
                  setAlasan('');
                  setBadalId('');
                  setBadalSearch('');
                  setFormError('');
                  setShowAddModal(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ajukan Izin Libur</span>
              </button>
            )}
          </div>
        </div>

        {/* Informative alert if Pejuang is outside the 4 eligible units */}
        {!userCanApply && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-2 text-xs text-amber-800 dark:text-amber-200">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold">Informasi Cakupan Modul Libur Pengurus:</p>
              <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-300">
                Modul ini dikhususkan bagi Pengurus pada Unit SDIQu, SMPIQu, SMAIQu, dan Kepondokan Banat. Pengajuan libur untuk divisi lain dapat dilakukan melalui menu <strong>Pengajuan Cuti</strong> atau <strong>Izin Keluar</strong>. Anda tetap dapat melihat permohonan jika ditunjuk sebagai Badal.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Total Pengajuan</span>
          <span className="text-xl font-black text-slate-800 dark:text-slate-100">{stats.total}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 block">Menunggu Approval</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.pending}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block">Disetujui</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.approved}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 block">Sedang Libur</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400">{stats.active}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
          {(['Semua', 'Menunggu', 'Disetujui', 'Ditolak'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'Menunggu' ? 'Menunggu Persetujuan' : tab}
            </button>
          ))}
        </div>

        {/* Search & Division Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pejuang / badal..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 w-48 sm:w-56"
            />
          </div>

          <select
            value={filterDivisi}
            onChange={(e) => setFilterDivisi(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="Semua">Semua Unit</option>
            {SUB_DIVISI_LIBUR_PENGURUS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Records Table / List */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CalendarOff className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Belum ada data izin libur pengurus</p>
            <p className="text-xs text-slate-400 mt-1">Data pengajuan akan tampil di sini setelah dibuat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Pejuang & Unit</th>
                  <th className="p-4">Periode Libur</th>
                  <th className="p-4">Badal (Pengganti)</th>
                  <th className="p-4">Keperluan</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredList.map((rec) => {
                  const canManage = isApprover(rec.subDivisi);
                  const isPending = rec.status === 'Menunggu Persetujuan';
                  const isApproved = rec.status === 'Disetujui';

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {rec.pejuangName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <span>{rec.amanah}</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{rec.subDivisi}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-200">
                          {rec.tanggalMulai} s/d {rec.tanggalSelesai}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Total: <strong className="text-slate-600 dark:text-slate-300">{rec.totalHari} Hari</strong>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1">
                          <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{rec.badalName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 pl-4.5">
                          {rec.badalAmanah}
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-300 truncate" title={rec.alasan}>
                          {rec.alasan || '-'}
                        </p>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            rec.status === 'Disetujui'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : rec.status === 'Ditolak'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Print PDF button for approved records */}
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => handleGeneratePDF(rec)}
                              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                              title="Cetak Surat PDF"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}

                          {/* Detail button */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetail(rec)}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Approve / Reject for Approvers */}
                          {canManage && isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveReject(rec, 'Disetujui')}
                                className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                                title="Setujui Permohonan"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApproveReject(rec, 'Ditolak')}
                                className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                                title="Tolak Permohonan"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Ajukan Izin Libur */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <CalendarOff className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  Form Pengajuan Izin Libur Pengurus
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 my-4">
              {/* Target Pejuang Selector (Admin can pick, Pejuang defaults to self) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Nama Pejuang Pemohon
                </label>
                {isAdmin ? (
                  <select
                    value={targetPejuangId}
                    onChange={(e) => setTargetPejuangId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  >
                    {eligiblePejuangList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.amanah} ({p.subDivisi})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {targetUser.name} — {targetUser.amanah} ({targetUser.subDivisi})
                  </div>
                )}
              </div>

              {/* Sub-divisi display */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Amanah / Jabatan
                  </label>
                  <input
                    type="text"
                    disabled
                    value={targetUser.amanah || 'Pengurus Unit'}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Sub Divisi / Unit
                  </label>
                  <input
                    type="text"
                    disabled
                    value={targetUser.subDivisi || '-'}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Tanggal Mulai Libur
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-bold focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Tanggal Selesai Libur
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-bold focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs flex items-center justify-between">
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">Estimasi Total Libur:</span>
                <span className="font-extrabold text-emerald-800 dark:text-emerald-200">{calculatedTotalHari} Hari</span>
              </div>

              {/* Alasan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Keperluan / Alasan Izin Libur
                </label>
                <textarea
                  rows={2}
                  required
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  placeholder="Contoh: Menghadiri hajat keluarga di luar kota..."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Badal Selector (Search-as-you-type) */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                    Pemegang Tanggung Jawab Sementara (Badal) <span className="text-rose-500">*</span>
                  </label>
                  {badalUser && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ Badal Terpilih: {badalUser.name}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Pilih pejuang yang akan menggantikan dan memegang amanah harian Anda selama masa libur.
                </p>

                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={badalSearch}
                      onChange={(e) => setBadalSearch(e.target.value)}
                      placeholder="Ketik nama atau amanah calon Badal..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                    {badalCandidates.slice(0, 20).map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => {
                          setBadalId(cand.id);
                          setBadalSearch(cand.name);
                        }}
                        className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between transition-colors ${
                          badalId === cand.id
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{cand.name}</div>
                          <div className={`text-[10px] ${badalId === cand.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {cand.amanah} • {cand.subDivisi}
                          </div>
                        </div>
                        {badalId === cand.id && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                      </div>
                    ))}
                    {badalCandidates.length === 0 && (
                      <div className="text-center py-3 text-slate-400 text-xs">
                        Tidak ditemukan pejuang dengan kata kunci tersebut.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !badalId}
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Permohonan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Detail & Approval Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Rincian Permohonan Izin Libur</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Pemohon:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{selectedDetail.pejuangName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Amanah & Unit:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {selectedDetail.amanah} • {selectedDetail.subDivisi}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Waktu Libur:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedDetail.tanggalMulai} s/d {selectedDetail.tanggalSelesai} ({selectedDetail.totalHari} Hari)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Badal (Pengganti):</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {selectedDetail.badalName} ({selectedDetail.badalAmanah})
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">Keperluan:</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">{selectedDetail.alasan || '-'}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-extrabold">{selectedDetail.status}</span>
                </div>
                {selectedDetail.approvedBy && (
                  <div className="text-[11px] text-slate-500">
                    Diverifikasi oleh: <strong>{selectedDetail.approvedBy}</strong> ({selectedDetail.approvedAt})
                  </div>
                )}
              </div>

              {/* Action for Approver */}
              {isApprover(selectedDetail.subDivisi) && selectedDetail.status === 'Menunggu Persetujuan' && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-2">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block">Tindakan Persetujuan:</span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Menyetujui permohonan ini akan secara otomatis membuat status absensi pejuang menjadi <strong>Libur</strong> pada tanggal tersebut serta menerbitkan Surat Izin resmi.
                  </p>
                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleApproveReject(selectedDetail, 'Disetujui')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Setujui</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveReject(selectedDetail, 'Ditolak')}
                      className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              {selectedDetail.status === 'Disetujui' ? (
                <button
                  type="button"
                  onClick={() => handleGeneratePDF(selectedDetail)}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Surat PDF</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
