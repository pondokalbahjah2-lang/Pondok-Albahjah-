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
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleFilePassword, setSingleFilePassword] = useState('');
  
  const [revealSlipId, setRevealSlipId] = useState('');
  const [revealPasswordInput, setRevealPasswordInput] = useState('');
  const [revealedPassword, setRevealedPassword] = useState('');
  const [revealError, setRevealError] = useState('');

        
  const [stagedBulkFiles, setStagedBulkFiles] = useState<StagedBulkUpload[]>([]);
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
    if (!singleFile) {
      alert('Silakan pilih file PDF Slip Ubar.');
      return;
    }
    
    const pejuangObj = accounts.find((a) => a.id === selectedPejuangId);
    if (!pejuangObj) return;

    const finalFileName = fileName || `Slip_Ubar_${pejuangObj.name.replace(/\s+/g, '_')}_${periode.replace(/\s+/g, '')}.pdf`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const newSlip: SlipUbarRecord = {
        id: `ubar-${Date.now()}`,
        pejuangId: pejuangObj.id,
        pejuangName: pejuangObj.name,
        periode,
        tanggalUpload: getLocalDateString(new Date()),
        fileName: finalFileName,
        fileUrl: base64Url,
        filePassword: singleFilePassword
      };

      onSaveSlipUbar([newSlip, ...slipUbarList]);
      setFileName('');
      setSingleFile(null);
      setSingleFilePassword('');
      alert(`Dokumen Slip Ubar ${periode} untuk ${pejuangObj.name} berhasil diunggah.`);
    };
    reader.readAsDataURL(singleFile);
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const staged: StagedBulkUpload[] = (Array.from(files) as File[]).map((file: File, index: number) => {
      // Try to find a pejuang by matching filename
      const matchedPejuang = pejuangAccounts.find(p => 
        file.name?.toLowerCase().includes(p.name?.toLowerCase() || '')
      );

      return {
        id: `staged-${index}-${Date.now()}`,
        file,
        fileName: file.name,
        matchedPejuangId: matchedPejuang ? matchedPejuang.id : '',
        filePassword: '',
        periode,
      };
    });

    setStagedBulkFiles(staged);
    e.target.value = '';
  };

  const handleUpdateStagedPejuang = (id: string, pejuangId: string) => {
    setStagedBulkFiles(prev => prev.map(s => s.id === id ? { ...s, matchedPejuangId: pejuangId } : s));
  };

  const handleUpdateStagedPassword = (id: string, pass: string) => {
    setStagedBulkFiles(prev => prev.map(s => s.id === id ? { ...s, filePassword: pass } : s));
  };


  const handleUpdateStagedFile = (id: string, newFile: File) => {
    setStagedBulkFiles(prev => prev.map(s => s.id === id ? { ...s, file: newFile, fileName: newFile.name } : s));
  };

  const handleRemoveStaged = (id: string) => {
    setStagedBulkFiles(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveBulk = async () => {
    if (stagedBulkFiles.some(s => !s.matchedPejuangId)) {
      alert("Ada slip yang belum dipetakan ke pejuang. Mohon lengkapi terlebih dahulu.");
      return;
    }

    const readFileAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    try {
      const newSlips: SlipUbarRecord[] = await Promise.all(stagedBulkFiles.map(async (s, index) => {
        const pejuang = pejuangAccounts.find(p => p.id === s.matchedPejuangId);
        const base64Url = await readFileAsDataURL(s.file);
        return {
          id: `ubar-bulk-${index}-${Date.now()}`,
          pejuangId: s.matchedPejuangId,
          pejuangName: pejuang ? pejuang.name : 'Unknown Pejuang',
          periode: s.periode,
          tanggalUpload: getLocalDateString(new Date()),
          fileName: s.fileName,
          fileUrl: base64Url,
          filePassword: s.filePassword,
        };
      }));

      onSaveSlipUbar([...newSlips, ...slipUbarList]);
      setStagedBulkFiles([]);
      alert(`Upload Sekaligus Berhasil! ${newSlips.length} dokumen slip ubar telah disimpan.`);
    } catch (error) {
      alert('Terjadi kesalahan saat memproses file PDF.');
      console.error(error);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  File Dokumen PDF
                </label>
                <input
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSingleFile(e.target.files[0]);
                      if (!fileName) setFileName(e.target.files[0].name);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Nama File Dokumen PDF
                </label>

                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Contoh: Slip_Ubar_Agustus.pdf"
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

          {/* Bulk Upload Feature */}
          <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Upload Massal / Sekaligus Slip Ubar</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Upload berkas slip ubar secara sekaligus untuk seluruh pejuang terdaftar pada periode berjalan. Sistem akan otomatis memetakan dokumen ke masing-masing akun pejuang.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                Periode Aktif Bulk: {periode}
              </div>
              <label className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition-all flex justify-center items-center cursor-pointer">
                <span>Upload Sekaligus Untuk Seluruh Pejuang</span>
                <input 
                  type="file" 
                  multiple 
                  accept="application/pdf,image/*" 
                  className="hidden" 
                  onChange={handleBulkUpload} 
                />
              </label>
            </div>
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

                        download={slip.fileName}
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Dokumen</span>
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

      

      {/* Staged Bulk Upload Modal */}
      {stagedBulkFiles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <span>Review & Sesuaikan Upload Massal ({stagedBulkFiles.length} File)</span>
              </h3>
              <button
                onClick={() => setStagedBulkFiles([])}
                className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {stagedBulkFiles.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs" title={item.fileName}>File: <span className="font-bold text-slate-200">{item.fileName}</span></div>
                    <div className="text-xs text-slate-400">Bulan: <span className="font-bold text-slate-200">{item.periode}</span></div>
                  </div>
                  
                  <div className="w-full sm:w-64 space-y-2">
                    <select
                      value={item.matchedPejuangId}
                      onChange={(e) => handleUpdateStagedPejuang(item.id, e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold ${!item.matchedPejuangId ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-slate-900 border-slate-700 text-slate-200'} border`}
                    >
                      <option value="">-- Pilih Pejuang (Wajib) --</option>
                      {pejuangAccounts.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      placeholder="Kata Sandi PDF (Opsional)" 
                      value={item.filePassword || ''}
                      onChange={(e) => handleUpdateStagedPassword(item.id, e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-200 focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex space-x-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <label className="py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold cursor-pointer transition-colors shadow-sm text-center flex-1 sm:flex-none">
                      <span>Ubah File</span>
                      <input 
                        type="file" 
                        accept="application/pdf,image/*" 
                        className="hidden" 
                        onChange={(e) => {
                           if (e.target.files?.[0]) handleUpdateStagedFile(item.id, e.target.files[0]);
                        }} 
                      />
                    </label>
                    <button
                      onClick={() => handleRemoveStaged(item.id)}
                      className="py-2.5 px-4 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-colors shadow-sm flex-1 sm:flex-none"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-900 flex justify-end">
               <button
                  onClick={handleSaveBulk}
                  className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
               >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Semua Slip Ubar</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
