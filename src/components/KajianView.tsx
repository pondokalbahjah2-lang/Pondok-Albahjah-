import { BookOpen, MapPin, Search, Download, Check, X, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAccount, KajianRecord } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { calculateDistanceMeters } from '../utils/storage';

import { LocationMap } from './LocationMap';
import { AnimatedDownloadButton } from './AnimatedDownloadButton';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface KajianViewProps {
  currentUser: UserAccount;
  kajianRecords: KajianRecord[];
  onSaveKajian: (records: KajianRecord[]) => void;
  onForceSync?: () => Promise<void>;
  accounts: UserAccount[];
  locationSettings: any;
}

export const KajianView: React.FC<KajianViewProps> = ({ currentUser, kajianRecords, onSaveKajian, accounts, locationSettings, onForceSync }) => {
  const isAdmin = currentUser.role === 'Admin';
  
  const [kajianName, setKajianName] = useState("Kajian Tafsir Al-Qur'an Setiap Sabtu Pagi");
  const [mode, setMode] = useState<'Offline' | 'Online'>('Offline');
  const [kajianDate, setKajianDate] = useState(getLocalDateString(new Date()));
  const [attendancePhotoUrl, setAttendancePhotoUrl] = useState('');
  const [notesPhotoUrl, setNotesPhotoUrl] = useState('');
  
  const [locationStatus, setLocationStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [locError, setLocError] = useState('');
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  const [coords, setCoords] = useState<{lat: number, lng: number}>({lat: 0, lng: 0});
  
  // Admin Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartDate, setFilterStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalDateString(d);
});
  const [filterEndDate, setFilterEndDate] = useState(getLocalDateString(new Date()));
  const [confirmAction, setConfirmAction] = useState<{id: string, status: "Valid" | "Ditolak"} | null>(null);

    const isAlHikam = kajianName === "Kajian Al-Hikam Senin Malam";
  const targetLat = isAlHikam ? -6.7100287 : (locationSettings.latitude || 0);
  const targetLng = isAlHikam ? 108.5583596 : (locationSettings.longitude || 0);
  const targetRadius = isAlHikam ? 300 : (locationSettings.radiusMaxMeters || 150);

  useEffect(() => {
    let watchId: number;
    if (mode === 'Offline') {
      if ('geolocation' in navigator) {
        setLocationStatus('loading');
        setLocError('');
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setCoords({ lat, lng });
            const dist = calculateDistanceMeters(
              lat,
              lng,
              targetLat,
              targetLng
            );
            setDistanceMeters(dist);
            setLocationStatus('success');
          },
          (err) => {
            console.warn('Geolocation error:', err);
            let errMsg = 'Gagal mengambil lokasi.';
            if (err.code === err.PERMISSION_DENIED) errMsg = 'Izin akses lokasi ditolak.';
            if (err.code === err.POSITION_UNAVAILABLE) errMsg = 'Lokasi tidak tersedia.';
            if (err.code === err.TIMEOUT) errMsg = 'Waktu permintaan habis.';
            setLocError(errMsg);
            setLocationStatus('error');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        setLocError('Browser tidak mendukung Geolocation.');
        setLocationStatus('error');
      }
    }
    return () => {
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [mode, kajianName, targetLat, targetLng]);

  const isWithinRadius = distanceMeters !== null && distanceMeters <= targetRadius;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'Offline') {
      if (locationStatus !== 'success') {
        alert("Harap ambil lokasi Anda terlebih dahulu untuk absen Offline.");
        return;
      }
      if (!isWithinRadius) {
        alert(`Absen ditolak: Anda berada di luar radius lokasi (${distanceMeters}m / Maks ${targetRadius}m).`);
        return;
      }
    }
    if (!attendancePhotoUrl || !notesPhotoUrl) {
      alert("Mohon isi link Google Drive untuk foto kehadiran dan catatan.");
      return;
    }

    const newRecord: KajianRecord = {
      id: `kj-${Date.now()}`,
      pejuangId: currentUser.id,
      pejuangName: currentUser.name,
      subDivisi: currentUser.subDivisi,
      date: kajianDate,
      kajianName,
      mode,
      latitude: coords.lat,
      longitude: coords.lng,
      attendancePhotoUrl,
      notesPhotoUrl,
      statusValidasi: 'pending' as any // For compatibility with older records we can just use the statusValidasi field. We actually declared 'Valid' | 'Ditolak' in types, but pending is implicitly when it is undefined.
    };

    onSaveKajian([newRecord, ...kajianRecords]);
    alert("Absensi Kajian Berhasil Disimpan!");
    setAttendancePhotoUrl('');
    setNotesPhotoUrl('');
    setKajianDate(getLocalDateString(new Date()));
    setLocationStatus('idle');
  };

  const filteredRecords = kajianRecords.filter(r => {
    const rDate = r.date || '';
    if (rDate < filterStartDate || rDate > filterEndDate) return false;
    if (searchQuery && !(r.pejuangName || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleValidateClick = (id: string, status: 'Valid' | 'Ditolak') => {
    if (navigator.vibrate) navigator.vibrate(50);
    setConfirmAction({ id, status });
  };

  const confirmValidation = () => {
    if (!confirmAction) return;
    const { id, status } = confirmAction;
    const updatedRecords = kajianRecords.map(r => r.id === id ? { ...r, statusValidasi: status } : r);
    onSaveKajian(updatedRecords);
    setConfirmAction(null);
  };

  const generateSummary = (records: KajianRecord[]) => {
    const summary: Record<string, any> = {};
    records.forEach(r => {
      const pn = r.pejuangName || 'Unknown';
      if (!summary[pn]) {
        summary[pn] = {
          'Nama Pejuang': pn,
          'Sub Divisi': r.subDivisi || '-',
          'Total Absen': 0,
          'Total Catatan': 0,
          'Tafsir (Offline)': 0,
          'Tafsir (Offline) Catatan': 0,
          'Tafsir (Offline) Tanpa Catatan': 0,
          'Tafsir (Online)': 0,
          'Tafsir (Online) Catatan': 0,
          'Tafsir (Online) Tanpa Catatan': 0,
          'Mukhtasor (Offline)': 0,
          'Mukhtasor (Offline) Catatan': 0,
          'Mukhtasor (Offline) Tanpa Catatan': 0,
          'Mukhtasor (Online)': 0,
          'Mukhtasor (Online) Catatan': 0,
          'Mukhtasor (Online) Tanpa Catatan': 0,
          'Al-Hikam (Offline)': 0,
          'Al-Hikam (Offline) Catatan': 0,
          'Al-Hikam (Offline) Tanpa Catatan': 0,
          'Al-Hikam (Online)': 0,
          'Al-Hikam (Online) Catatan': 0,
          'Al-Hikam (Online) Tanpa Catatan': 0
        };
      }
      
      summary[pn]['Total Absen'] += 1;
      const hasCatatan = r.statusValidasi !== 'Ditolak' && !!r.notesPhotoUrl;
      if (hasCatatan) summary[pn]['Total Catatan'] += 1;
  
      let kName = r.kajianName || '';
      let isOffline = r.mode === 'Offline';
      let isTafsir = kName.includes('Tafsir');
      let isMukhtasor = kName.includes('Mukhtasor');
      let isHikam = kName.includes('Al-Hikam');
  
      if (isTafsir) {
          if (isOffline) {
              summary[pn]['Tafsir (Offline)'] += 1;
              if (hasCatatan) summary[pn]['Tafsir (Offline) Catatan'] += 1;
              else summary[pn]['Tafsir (Offline) Tanpa Catatan'] += 1;
          } else {
              summary[pn]['Tafsir (Online)'] += 1;
              if (hasCatatan) summary[pn]['Tafsir (Online) Catatan'] += 1;
              else summary[pn]['Tafsir (Online) Tanpa Catatan'] += 1;
          }
      } else if (isMukhtasor) {
          if (isOffline) {
              summary[pn]['Mukhtasor (Offline)'] += 1;
              if (hasCatatan) summary[pn]['Mukhtasor (Offline) Catatan'] += 1;
              else summary[pn]['Mukhtasor (Offline) Tanpa Catatan'] += 1;
          } else {
              summary[pn]['Mukhtasor (Online)'] += 1;
              if (hasCatatan) summary[pn]['Mukhtasor (Online) Catatan'] += 1;
              else summary[pn]['Mukhtasor (Online) Tanpa Catatan'] += 1;
          }
      } else if (isHikam) {
          if (isOffline) {
              summary[pn]['Al-Hikam (Offline)'] += 1;
              if (hasCatatan) summary[pn]['Al-Hikam (Offline) Catatan'] += 1;
              else summary[pn]['Al-Hikam (Offline) Tanpa Catatan'] += 1;
          } else {
              summary[pn]['Al-Hikam (Online)'] += 1;
              if (hasCatatan) summary[pn]['Al-Hikam (Online) Catatan'] += 1;
              else summary[pn]['Al-Hikam (Online) Tanpa Catatan'] += 1;
          }
      }
    });
  
    return Object.values(summary).sort((a: any, b: any) => a['Nama Pejuang'].localeCompare(b['Nama Pejuang']));
  };

  const handleDownloadExcel = () => {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const data = filteredRecords.map(r => ({
      'Tanggal': r.date,
      'Nama Pejuang': r.pejuangName,
      'Sub Divisi': r.subDivisi,
      'Kajian': r.kajianName,
      'Mode': r.mode,
      'Link Hadir': r.attendancePhotoUrl || '-',
      'Link Catatan': r.statusValidasi === 'Ditolak' ? 'Tidak Ada' : (r.notesPhotoUrl || '-')
    }));
    
    const summaryData = generateSummary(filteredRecords);

    const wsData = XLSX.utils.json_to_sheet(data);
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsData, "Kajian");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Rekapitulasi");
    
    XLSX.writeFile(wb, `Laporan_Kajian_${filterStartDate}_sd_${filterEndDate}.xlsx`);
  };

  const handleDownloadPDF = () => {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const doc = new jsPDF('landscape');
    
    // First Page: Raw Data
    doc.text(`Laporan Absensi Kajian Buya Yahya (${filterStartDate} s/d ${filterEndDate})`, 14, 15);
    
    const tableData = filteredRecords.map(r => [
      r.date, r.pejuangName, r.subDivisi, r.kajianName, r.mode, r.attendancePhotoUrl ? 'Ada' : '-', r.statusValidasi === 'Ditolak' ? 'Tidak Ada' : (r.notesPhotoUrl ? 'Ada' : '-')
    ]);

    autoTable(doc, {
      startY: 20,
      head: [['Tanggal', 'Nama Pejuang', 'Sub Divisi', 'Kajian', 'Mode', 'Link Hadir', 'Link Catatan']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });
    
    // Second Page: Summary
    doc.addPage();
    doc.text(`Rekapitulasi Absensi Kajian (${filterStartDate} s/d ${filterEndDate})`, 14, 15);
    
    const summaryData = generateSummary(filteredRecords);
    const summaryHeaders = [
      'Nama', 'Total Hadir', 'Total Catat',
      'Tafsir (Off)', 'Tafsir (On)',
      'Mukhtasor (Off)', 'Mukhtasor (On)',
      'Al-Hikam (Off)', 'Al-Hikam (On)'
    ];
    
    // To fit in PDF, we simplify the summary table slightly or split it. Let's do a dense table.
    const summaryTableData = summaryData.map((s: any) => [
      s['Nama Pejuang'],
      s['Total Absen'],
      s['Total Catatan'],
      `${s['Tafsir (Offline)']} (${s['Tafsir (Offline) Catatan']}C / ${s['Tafsir (Offline) Tanpa Catatan']}T)`,
      `${s['Tafsir (Online)']} (${s['Tafsir (Online) Catatan']}C / ${s['Tafsir (Online) Tanpa Catatan']}T)`,
      `${s['Mukhtasor (Offline)']} (${s['Mukhtasor (Offline) Catatan']}C / ${s['Mukhtasor (Offline) Tanpa Catatan']}T)`,
      `${s['Mukhtasor (Online)']} (${s['Mukhtasor (Online) Catatan']}C / ${s['Mukhtasor (Online) Tanpa Catatan']}T)`,
      `${s['Al-Hikam (Offline)']} (${s['Al-Hikam (Offline) Catatan']}C / ${s['Al-Hikam (Offline) Tanpa Catatan']}T)`,
      `${s['Al-Hikam (Online)']} (${s['Al-Hikam (Online) Catatan']}C / ${s['Al-Hikam (Online) Tanpa Catatan']}T)`
    ]);

    autoTable(doc, {
      startY: 20,
      head: [summaryHeaders],
      body: summaryTableData,
      theme: 'grid',
      headStyles: { fillColor: [46, 204, 113] },
      styles: { fontSize: 7, cellPadding: 1 },
      columnStyles: {
        0: { cellWidth: 30 }
      }
    });

    doc.save(`Laporan_Kajian_${filterStartDate}_sd_${filterEndDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          Absensi Kajian Buya Yahya
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Formulir wajib pengisian absensi kajian untuk seluruh pejuang.
        </p>
      </div>

      {!isAdmin && (
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal Kajian</label>
              <input
                type="date"
                required
                value={kajianDate}
                onChange={e => setKajianDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Pilih Kajian</label>
              <select
                value={kajianName}
                onChange={e => setKajianName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Kajian Tafsir Al-Qur'an Setiap Sabtu Pagi">Kajian Tafsir Al-Qur'an Setiap Sabtu Pagi</option>
                <option value="Kajian Mukhtasor Attarghib Wattarghib Ahad Pagi">Kajian Mukhtasor Attarghib Wattarghib Ahad Pagi</option>
                <option value="Kajian Al-Hikam Senin Malam">Kajian Al-Hikam Senin Malam</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Mode Kehadiran</label>
              <select
                value={mode}
                onChange={e => setMode(e.target.value as 'Offline' | 'Online')}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Offline">Offline (Tatap Muka)</option>
                <option value="Online">Online</option>
              </select>
            </div>

            {mode === 'Offline' && (
              <>
              <div className={`p-4 border rounded-xl flex items-center justify-between ${
                locationStatus === 'success' 
                  ? (isWithinRadius ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800')
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              }`}>
                <div>
                  <p className={`text-xs font-bold mb-1 ${
                    locationStatus === 'success' 
                      ? (isWithinRadius ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')
                      : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    {locationStatus === 'loading' ? 'Mencari Lokasi GPS...' : 
                     locationStatus === 'success' ? 'Lokasi GPS Ditemukan' : 'Menunggu Akses GPS'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                    Sistem mendeteksi lokasi Anda secara otomatis.
                  </p>
                </div>
                <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/50 dark:bg-black/20 shadow-sm border border-black/5 dark:border-white/5">
                  <MapPin className={`w-5 h-5 ${
                    locationStatus === 'loading' ? 'text-amber-500 animate-pulse' :
                    locationStatus === 'success' ? (isWithinRadius ? 'text-emerald-500' : 'text-rose-500') :
                    'text-slate-400'
                  }`} />
                </div>
              </div>
              {locError && <div className="mt-2 p-2 bg-rose-100 text-rose-700 text-xs rounded-lg font-bold">{locError}</div>}
              {coords.lat !== 0 && coords.lng !== 0 && (
                <div className="mt-3">
                  <div className="text-xs mb-2">
                    Jarak dari pondok: <strong className={isWithinRadius ? 'text-emerald-600' : 'text-rose-600'}>{distanceMeters} meter</strong> (Maks: {targetRadius}m)
                  </div>
                  <div className="relative z-0 h-48 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <LocationMap 
                      userLat={coords.lat}
                      userLng={coords.lng}
                      pondokLat={targetLat}
                      pondokLng={targetLng}
                      radius={targetRadius}
                    />
                  </div>
                </div>
              )}
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Link GDrive Foto Kehadiran</label>
              <input
                type="url"
                required
                value={attendancePhotoUrl}
                onChange={e => setAttendancePhotoUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Link GDrive Foto Catatan Kajian</label>
              <input
                type="url"
                required
                value={notesPhotoUrl}
                onChange={e => setNotesPhotoUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all">
              Kirim Absensi Kajian
            </button>
          </form>
        </div>
      )}

      {!isAdmin && (
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Riwayat Absen Kajian Anda</h2>
          {kajianRecords.filter(r => r.pejuangId === currentUser.id).length === 0 ? (
             <p className="text-xs text-slate-500">Belum ada riwayat absensi kajian.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="py-2 px-3">Tanggal</th>
                    <th className="py-2 px-3">Kajian</th>
                    <th className="py-2 px-3">Status Validasi</th>
                  </tr>
                </thead>
                <tbody>
                  {kajianRecords.filter(r => r.pejuangId === currentUser.id).map(r => (
                    <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-3">{r.date}</td>
                      <td className="py-3 px-3 font-bold">{r.kajianName}</td>
                      <td className="py-3 px-3">
                        {r.statusValidasi === 'Valid' ? (
                          <span className="text-emerald-600 font-bold">Valid</span>
                        ) : r.statusValidasi === 'Ditolak' ? (
                          <span className="text-rose-600 font-bold">Ditolak</span>
                        ) : (
                          <span className="text-amber-600 font-bold">Menunggu</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end">
            <div className="flex flex-col md:flex-row gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tanggal Mulai</label>
                <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tanggal Akhir</label>
                <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs" />
              </div>
              <div className="flex items-end">
                <input type="text" placeholder="Cari nama..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs" />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={async () => {
                     if (onForceSync) {
                        const btn = document.getElementById('forceSyncBtn');
                        if (btn) btn.innerHTML = 'Menyinkronkan...';
                        await onForceSync();
                        if (btn) btn.innerHTML = 'Force Sync';
                     }
                  }}
                  id="forceSyncBtn"
                  className="p-2 px-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:bg-blue-200 transition-colors"
                >
                  Force Sync
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <AnimatedDownloadButton 
                onDownload={handleDownloadExcel} 
                text="Excel"
                className="bg-green-600 hover:bg-green-500 shadow-green-600/30"
              />
              <AnimatedDownloadButton 
                onDownload={handleDownloadPDF} 
                text="PDF"
                className="bg-red-600 hover:bg-red-500 shadow-red-600/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="py-2 px-3">Tanggal</th>
                  <th className="py-2 px-3">Nama Pejuang</th>
                  <th className="py-2 px-3">Sub Divisi</th>
                  <th className="py-2 px-3">Kajian</th>
                  <th className="py-2 px-3">Mode</th>
                  <th className="py-2 px-3 text-center">Bukti Hadir</th>
                  <th className="py-2 px-3 text-center">Bukti Catatan</th>
                  <th className="py-2 px-3 text-center">Validasi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-3">{r.date}</td>
                    <td className="py-3 px-3 font-bold">{r.pejuangName}</td>
                    <td className="py-3 px-3 text-slate-500">{r.subDivisi}</td>
                    <td className="py-3 px-3 text-emerald-600 font-semibold">{r.kajianName}</td>
                    <td className="py-3 px-3">{r.mode}</td>
                    <td className="py-3 px-3 text-center">
                      {r.attendancePhotoUrl ? <a href={r.attendancePhotoUrl} target="_blank" className="text-blue-500 underline">Lihat</a> : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {r.notesPhotoUrl ? <a href={r.notesPhotoUrl} target="_blank" className="text-blue-500 underline">Lihat</a> : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {r.statusValidasi === 'Valid' ? (
                           <span className="text-emerald-600 font-bold">Valid</span>
                        ) : r.statusValidasi === 'Ditolak' ? (
                           <span className="text-rose-600 font-bold">Ditolak</span>
                        ) : (
                          <>
                            <button onClick={() => handleValidateClick(r.id, 'Valid')} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200" title="Valid">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleValidateClick(r.id, 'Ditolak')} className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200" title="Tolak">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/20 dark:border-slate-700"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmAction.status === 'Valid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">Konfirmasi Validasi</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Apakah Anda yakin ingin memberikan status <strong className={confirmAction.status === 'Valid' ? 'text-emerald-600' : 'text-rose-600'}>{confirmAction.status}</strong> pada catatan kajian ini?
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmValidation}
                    className={`flex-1 py-3 rounded-2xl text-white font-bold text-xs shadow-lg ${confirmAction.status === 'Valid' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'}`}
                  >
                    Ya, {confirmAction.status}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
