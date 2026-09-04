import React, { useState } from 'react';
import { UserAccount, KajianRecord } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { BookOpen, MapPin, Search, Download, AlertTriangle } from 'lucide-react';

interface KajianViewProps {
  currentUser: UserAccount;
  kajianRecords: KajianRecord[];
  onSaveKajian: (records: KajianRecord[]) => void;
  accounts: UserAccount[];
}

export const KajianView: React.FC<KajianViewProps> = ({ currentUser, kajianRecords, onSaveKajian, accounts }) => {
  const isAdmin = currentUser.role === 'Admin';
  
  const [kajianName, setKajianName] = useState("Kajian Tafsir Al-Qur'an Setiap Sabtu Pagi");
  const [mode, setMode] = useState<'Offline' | 'Online'>('Offline');
  const [attendancePhotoUrl, setAttendancePhotoUrl] = useState('');
  const [notesPhotoUrl, setNotesPhotoUrl] = useState('');
  
  const [locationStatus, setLocationStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [coords, setCoords] = useState<{lat: number, lng: number}>({lat: 0, lng: 0});
  
  // Admin Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartDate, setFilterStartDate] = useState(getLocalDateString(new Date()));
  const [filterEndDate, setFilterEndDate] = useState(getLocalDateString(new Date()));

  const getLocation = () => {
    setLocationStatus('loading');
    setTimeout(() => {
      setCoords({lat: -6.74, lng: 108.55}); // Dummy coordinates
      setLocationStatus('success');
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'Offline' && locationStatus !== 'success') {
      alert("Harap ambil lokasi Anda terlebih dahulu untuk absen Offline.");
      return;
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
      date: getLocalDateString(new Date()),
      kajianName,
      mode,
      latitude: coords.lat,
      longitude: coords.lng,
      attendancePhotoUrl,
      notesPhotoUrl
    };

    onSaveKajian([newRecord, ...kajianRecords]);
    alert("Absensi Kajian Berhasil Disimpan!");
    setAttendancePhotoUrl('');
    setNotesPhotoUrl('');
    setLocationStatus('idle');
  };

  const filteredRecords = kajianRecords.filter(r => {
    if (r.date < filterStartDate || r.date > filterEndDate) return false;
    if (searchQuery && !r.pejuangName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDownloadCsv = () => {
    const header = "Nama Pejuang,Sub Divisi,Tanggal,Nama Kajian,Mode,Bukti Hadir,Bukti Catatan\n";
    const rows = filteredRecords.map(r => 
      `${r.pejuangName},${r.subDivisi},${r.date},${r.kajianName},${r.mode},${r.attendancePhotoUrl ? 'Ada' : 'Tidak Ada'},${r.notesPhotoUrl ? 'Ada' : 'Tidak Ada'}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Laporan_Kajian_${filterStartDate}_sd_${filterEndDate}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">Lokasi Wajib Dikunci (GPS)</p>
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={locationStatus === 'loading' || locationStatus === 'success'}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {locationStatus === 'loading' ? 'Mengunci Lokasi...' : locationStatus === 'success' ? 'Lokasi Terkunci!' : 'Ambil Lokasi Saat Ini'}
                </button>
              </div>
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
            </div>
            <button onClick={handleDownloadCsv} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2">
              <Download className="w-4 h-4" />
              Unduh Laporan Excel/CSV
            </button>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
