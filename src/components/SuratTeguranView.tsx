import { getLocalDateString } from '../utils/dateUtils';
import React, { useState } from 'react';
import {
  AlertOctagon,
  FileText,
  Upload,
  Plus,
  Search,
  ShieldAlert,
  Download,
  AlertTriangle,
  User,
} from 'lucide-react';
import { UserAccount, WarningLetterRecord } from '../types';

interface SuratTeguranViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  warningLetters: WarningLetterRecord[];
  onSaveWarningLetters: (records: WarningLetterRecord[]) => void;
}

export const SuratTeguranView: React.FC<SuratTeguranViewProps> = ({
  currentUser,
  accounts,
  warningLetters,
  onSaveWarningLetters,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [targetPejuangId, setTargetPejuangId] = useState('');
  const [type, setType] = useState<WarningLetterRecord['type']>('Surat Teguran');
  const [alasan, setAlasan] = useState('');
  const [tanggal, setTanggal] = useState(getLocalDateString(new Date()));
  const [fileName, setFileName] = useState('');

  const pejuangAccounts = accounts.filter((a) => a.role === 'Pejuang');

  // Filter warning letters
  const filteredLetters = warningLetters.filter((wl) => {
    // Role Pejuang can ONLY view their own warning letters
    const matchesUser =
      currentUser.role === 'Admin' || wl.pejuangId === currentUser.id;
    const matchesSearch =
      wl.pejuangName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wl.alasan?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'Semua' || wl.type === typeFilter;
    return matchesUser && matchesSearch && matchesType;
  });

  const handleCreateSP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPejuangId) {
      alert('Silakan pilih pejuang sasaran.');
      return;
    }

    const targetUser = accounts.find((a) => a.id === targetPejuangId);
    if (!targetUser) return;

    const newRecord: WarningLetterRecord = {
      id: `sp-${Date.now()}`,
      pejuangId: targetUser.id,
      pejuangName: targetUser.name,
      subDivisi: targetUser.subDivisi,
      type,
      tanggal,
      alasan,
      fileName: fileName || `${type.replace(/\s+/g, '_')}_${targetUser.name.replace(/\s+/g, '_')}.pdf`,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    };

    onSaveWarningLetters([newRecord, ...warningLetters]);
    setShowAddModal(false);
    setAlasan('');
    setFileName('');
    alert(`Rekap ${type} berhasil diterbitkan untuk ${targetUser.name}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
            <AlertOctagon className="w-4 h-4" />
            <span>Rekap Kedisiplinan Pejuang</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
            Rekap Surat Teguran & Surat Peringatan (SP)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser.role === 'Admin'
              ? 'Pengelolaan penerbitan dan pengunggahan berkas Surat Teguran dan SP'
              : 'Rekapitulasi berkas kedisiplinan pribadi Anda (Sesuai Hak Akses Pejuang)'}
          </p>
        </div>

        {currentUser.role === 'Admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Surat Teguran / SP</span>
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Cari nama atau alasan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
          {['Semua', 'Surat Teguran', 'SP 1', 'SP 2', 'SP 3'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                typeFilter === t
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Warning Letters List Table */}
      <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
              <th className="py-3 px-3">Pejuang & Sub Divisi</th>
              <th className="py-3 px-3">Tipe Berkas</th>
              <th className="py-3 px-3">Tanggal Diterbitkan</th>
              <th className="py-3 px-3">Alasan Kedisiplinan</th>
              <th className="py-3 px-3">Nama Berkas Attachment</th>
              <th className="py-3 px-3 text-right">Aksi Unduh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLetters.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                  {currentUser.role === 'Admin'
                    ? 'Belum ada Surat Teguran atau SP yang diunggah.'
                    : 'Alhamdulillah, tidak ada data Surat Teguran atau SP untuk akun Anda.'}
                </td>
              </tr>
            ) : (
              filteredLetters.map((wl) => (
                <tr
                  key={wl.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {wl.pejuangName}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {wl.subDivisi}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${
                        wl.type === 'Surat Teguran'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                      }`}
                    >
                      {wl.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                    {wl.tanggal}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-200 max-w-[250px]">
                    {wl.alasan}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {wl.fileName || 'Lampiran.pdf'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <a
                      href={wl.fileUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-slate-800 text-white font-bold text-[11px] hover:bg-slate-700 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Unduh File</span>
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add SP (Admin Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Upload Surat Teguran / SP</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSP} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilih Pejuang
                </label>
                <select
                  required
                  value={targetPejuangId}
                  onChange={(e) => setTargetPejuangId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipe Berkas Kedisiplinan
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold"
                >
                  <option value="Surat Teguran">Surat Teguran</option>
                  <option value="SP 1">SP 1 (Surat Peringatan Pertama)</option>
                  <option value="SP 2">SP 2 (Surat Peringatan Kedua)</option>
                  <option value="SP 3">SP 3 (Surat Peringatan Ketiga)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tanggal Penerbitan
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alasan Kedisiplinan
                </label>
                <textarea
                  required
                  rows={2}
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  placeholder="Detail alasan keterlambatan atau pelanggaran kaidah..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lampiran Berkas File PDF
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Contoh: Surat_Teguran_Ahmad.pdf"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Simpan & Terbitkan Berkas
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
