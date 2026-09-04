import { getLocalDateString } from '../utils/dateUtils';
import React, { useState } from 'react';
import {
  FileText,
  Download,
  Upload,
  Mail,
  Lock,
  Search,
  CheckCircle,
  FileCheck,
  Send,
  Eye,
  Key,
} from 'lucide-react';
import { UserAccount, SlipUbarRecord } from '../types';

interface SlipUbarViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  slipUbarList: SlipUbarRecord[];
  onSaveSlipUbar: (records: SlipUbarRecord[]) => void;
  onUpdateAccountPassword?: (pejuangId: string, newPass: string) => void;
}

interface StagedBulkUpload {
  filePassword?: string;
  id: string;
  file: File;
  fileName: string;
  matchedPejuangId: string;
  periode: string;
}

export const SlipUbarView: React.FC<SlipUbarViewProps> = ({
  currentUser,
  accounts,
  slipUbarList,
  onSaveSlipUbar,
  onUpdateAccountPassword,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPejuangId, setSelectedPejuangId] = useState('');
  const [periode, setPeriode] = useState('Agustus 2026');
  const [fileName, setFileName] = useState('');
  const [gdriveLink, setGdriveLink] = useState("");
  const [singleFilePassword, setSingleFilePassword] = useState('');
  
  const [bulkRows, setBulkRows] = useState([{ pejuangId: '', gdriveLink: '', password: '' }]);
  const [bulkPeriode, setBulkPeriode] = useState('Agustus 2026');

  const [revealSlipId, setRevealSlipId] = useState('');
  const [revealPasswordInput, setRevealPasswordInput] = useState('');
  const [revealedPassword, setRevealedPassword] = useState('');
  const [revealError, setRevealError] = useState('');

        
    const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const pejuangAccounts = accounts.filter((a) => a.role === 'Pejuang');

  // Filter Slip Ubar list
  const filteredSlips = slipUbarList.filter((s) => {
    const matchesUser =
      currentUser.role === 'Admin' || s.pejuangId === currentUser.id;
    const matchesSearch =
      s.pejuangName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.periode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUser && matchesSearch;
  });

  
  const handleUploadSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPejuangId) {
      alert('Silakan pilih pejuang sasaran upload slip ubar.');
      return;
    }
    if (!gdriveLink) {
      alert('Silakan masukkan Link Google Drive Slip Ubar.');
      return;
    }
    
    const pejuangObj = accounts.find((a) => a.id === selectedPejuangId);
    if (!pejuangObj) return;

    const finalFileName = fileName || `Slip_Ubar_${pejuangObj.name.replace(/\s+/g, '_')}_${periode.replace(/\s+/g, '')}`;

    const newSlip: SlipUbarRecord = {
      id: `ubar-${Date.now()}`,
      pejuangId: pejuangObj.id,
      pejuangName: pejuangObj.name,
      periode,
      tanggalUpload: getLocalDateString(new Date()),
      fileName: finalFileName,
      fileUrl: gdriveLink,
      filePassword: singleFilePassword
    };

    onSaveSlipUbar([newSlip, ...slipUbarList]);
    setFileName('');
    setGdriveLink('');
    setSingleFilePassword('');
    alert(`Link Dokumen Slip Ubar ${periode} untuk ${pejuangObj.name} berhasil disimpan.`);
  };

  const handleBulkUploadSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkRows.length === 0) return;

    const newSlips: SlipUbarRecord[] = [];
    
    let errorLines = 0;

    bulkRows.forEach(row => {
      if (!row.pejuangId || !row.gdriveLink) return;

      const pejuangObj = pejuangAccounts.find(p => p.id === row.pejuangId);
      if (pejuangObj) {
        const finalFileName = `Slip_Ubar_${pejuangObj.name.replace(/\s+/g, '_')}_${bulkPeriode.replace(/\s+/g, '')}`;
        newSlips.push({
          id: `ubar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          pejuangId: pejuangObj.id,
          pejuangName: pejuangObj.name,
          periode: bulkPeriode,
          tanggalUpload: getLocalDateString(new Date()),
          fileName: finalFileName,
          fileUrl: row.gdriveLink,
          filePassword: row.password
        });
      } else {
        errorLines++;
      }
    });

    if (newSlips.length > 0) {
      onSaveSlipUbar([...newSlips, ...slipUbarList]);
      alert(`Berhasil mengunggah ${newSlips.length} slip ubar massal.` + (errorLines > 0 ? ` Gagal memproses ${errorLines} baris.` : ''));
      setBulkRows([{ pejuangId: '', gdriveLink: '', password: '' }]);
    } else {
      alert('Tidak ada slip ubar yang berhasil diproses. Pastikan data terisi dengan benar.');
    }
  };

  
  
  

  
  
  

  
  const handleRevealPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (revealPasswordInput === currentUser.password || currentUser.role === 'Admin') {
      const slip = slipUbarList.find(s => s.id === revealSlipId);
      if (slip) {
        setRevealedPassword(slip.filePassword || '(Tidak ada kata sandi)');
        setRevealError('');
      }
    } else {
      setRevealError('Kata sandi akun salah.');
      setRevealedPassword('');
    }
  };



  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Pemberkasan Dokumen Slip Ubar Pejuang</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
            {currentUser.role === 'Admin' ? 'Kelola & Upload Slip Ubar' : 'Unduh Slip Ubar Saya'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Khusus unduh dokumen resmi slip ubar (tanpa penampilan nominal pada antarmuka UI)
          </p>
        </div>

        {/* 1-Click Button Send All Passwords via Email for Admin */}

      </div>

      {/* Admin Upload Section */}
      {currentUser.role === 'Admin' && (
        <div className="grid grid-cols-1 max-w-3xl mx-auto gap-6">
          {/* Individual Upload */}
          <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Upload Dokumen Slip Ubar Per Pejuang</span>
            </h2>

            <form onSubmit={handleUploadSlip} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Pilih Pejuang
                </label>
                <select
                  required
                  value={selectedPejuangId}
                  onChange={(e) => setSelectedPejuangId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Pilih Pejuang --</option>
                  {pejuangAccounts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.subDivisi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Periode Ubar
                </label>
                <input
                  type="text"
                  required
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  placeholder="Contoh: Agustus 2026"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              
                            <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Link Google Drive Slip Ubar
                </label>
                <input
                  type="url"
                  required
                  value={gdriveLink}
                  onChange={(e) => setGdriveLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Nama Tampilan Slip Ubar
                </label>

                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Contoh: Slip Ubar Agustus"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Kata Sandi File PDF (Opsional)
                </label>
                <input
                  type="text"
                  value={singleFilePassword}
                  onChange={(e) => setSingleFilePassword(e.target.value)}
                  placeholder="Contoh: 123456"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all">Upload Slip Ubar Single</button>
            </form>
          </div>

          {/* Bulk Upload Dynamic */}
          <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Upload Slip Ubar Massal</span>
            </h2>
            <form onSubmit={handleBulkUploadSlip} className="space-y-3">
              <div className="space-y-2">
                {bulkRows.map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      required
                      value={row.pejuangId}
                      onChange={(e) => {
                        const newRows = [...bulkRows];
                        newRows[index].pejuangId = e.target.value;
                        setBulkRows(newRows);
                      }}
                      className="w-1/3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    >
                      <option value="">-- Pejuang --</option>
                      {pejuangAccounts.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input
                      type="url"
                      required
                      placeholder="Link GDrive..."
                      value={row.gdriveLink}
                      onChange={(e) => {
                        const newRows = [...bulkRows];
                        newRows[index].gdriveLink = e.target.value;
                        setBulkRows(newRows);
                      }}
                      className="w-1/3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="Password..."
                      value={row.password}
                      onChange={(e) => {
                        const newRows = [...bulkRows];
                        newRows[index].password = e.target.value;
                        setBulkRows(newRows);
                      }}
                      className="w-1/4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newRows = bulkRows.filter((_, i) => i !== index);
                        setBulkRows(newRows);
                      }}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setBulkRows([...bulkRows, { pejuangId: '', gdriveLink: '', password: '' }])}
                className="w-full py-2 border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs"
              >
                + Tambah Baris Pejuang
              </button>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Periode Ubar (Untuk Semua)
                </label>
                <input
                  type="text"
                  required
                  value={bulkPeriode}
                  onChange={(e) => setBulkPeriode(e.target.value)}
                  placeholder="Contoh: Agustus 2026"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all">Upload Slip Ubar Massal</button>
            </form>
          </div>

                  </div>
      )}
      {/* Document List & Download Table */}
      <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            Daftar Dokumen Slip Ubar Terdaftar
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Cari periode atau nama..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Nama Pejuang</th>
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3">Tanggal Upload</th>
                <th className="py-2.5 px-3">Nama Berkas</th>
                <th className="py-2.5 px-3 text-right">Unduh Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSlips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Belum ada dokumen slip ubar yang diunggah.
                  </td>
                </tr>
              ) : (
                filteredSlips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((slip) => (
                  <tr
                    key={slip.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                      {slip.pejuangName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        {slip.periode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{slip.tanggalUpload}</td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      <div className="flex flex-col space-y-1.5">
                        <span className="truncate max-w-[150px] sm:max-w-[200px]" title={slip.fileName}>{slip.fileName}</span>
                        {slip.filePassword && (
                          <span title="Dilindungi Kata Sandi" className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold w-fit border border-amber-200 dark:border-amber-800/50">
                            <Lock className="w-3 h-3" />
                            <span>Dilindungi Sandi</span>
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-3 px-3 text-right flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setRevealSlipId(slip.id);
                          setRevealPasswordInput('');
                          setRevealedPassword('');
                          setRevealError('');
                        }}
                        className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shadow-sm transition-colors"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Sandi</span>
                      </button>
                      <a
      href={slip.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Buka Link</span>
    </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {Math.ceil(filteredSlips.length / itemsPerPage) > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Halaman {currentPage} dari {Math.ceil(filteredSlips.length / itemsPerPage)}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredSlips.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(filteredSlips.length / itemsPerPage)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}

      </div>

      
      {/* Modal View Password */}
      {revealSlipId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-center">Akses Sandi Slip Ubar</h3>
            {revealedPassword ? (
              <div className="text-center space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">Kata sandi file PDF Anda:</p>
                <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  {revealedPassword}
                </div>
                <button
                  onClick={() => setRevealSlipId('')}
                  className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleRevealPassword} className="space-y-4">
                {revealError && <div className="p-2 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold text-center">{revealError}</div>}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 text-center">
                    Masukkan Kata Sandi Akun Anda
                  </label>
                  <input
                    type="password"
                    required
                    value={revealPasswordInput}
                    onChange={(e) => setRevealPasswordInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono"
                    placeholder="****"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setRevealSlipId('')}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                  >
                    Buka
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Email 1-Click Password Dispatch */}

      

          </div>
  );
};
