import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { DivisiRecord, UserAccount, WorkSchedule } from '../types';
import { triggerHapticFeedback, HAPTIC_PATTERNS } from '../utils/vibration';

interface DivisiManagementProps {
  currentUser: UserAccount;
  divisions: DivisiRecord[];
  accounts: UserAccount[];
  schedules: WorkSchedule[];
  onSaveDivisions: (divs: DivisiRecord[]) => void;
  onSaveAccounts: (accs: UserAccount[]) => void;
  onSaveSchedules: (scheds: WorkSchedule[]) => void;
}

export const DivisiManagement: React.FC<DivisiManagementProps> = ({
  currentUser,
  divisions = [],
  accounts = [],
  schedules = [],
  onSaveDivisions,
  onSaveAccounts,
  onSaveSchedules,
}) => {
  const isAdmin = currentUser.role === 'Admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDivisiId, setEditingDivisiId] = useState<string | null>(null);

  // Form states
  const [namaDivisi, setNamaDivisi] = useState('');
  const [selectedPejuangIds, setSelectedPejuangIds] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [formError, setFormError] = useState('');

  // 2-Shift support
  const [hasTwoShifts, setHasTwoShifts] = useState(false);
  const [shift1, setShift1] = useState({
    id: 'shift_1',
    namaShift: 'Shift 1 (Pagi)',
    jamMasuk: '07:00',
    jamPulang: '15:00',
    toleransiMenit: 15
  });
  const [shift2, setShift2] = useState({
    id: 'shift_2',
    namaShift: 'Shift 2 (Siang/Sore)',
    jamMasuk: '14:00',
    jamPulang: '22:00',
    toleransiMenit: 15
  });
  const [memberShiftMap, setMemberShiftMap] = useState<Record<string, string>>({});

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DivisiRecord | null>(null);

  // Active pejuang only
  const pejuangAccounts = useMemo(() => {
    return accounts.filter(a => a.role === 'Pejuang');
  }, [accounts]);

  // Filtered divisions
  const filteredDivisions = useMemo(() => {
    if (!searchQuery.trim()) return divisions;
    const q = searchQuery.toLowerCase();
    return divisions.filter(d =>
      d.namaDivisi.toLowerCase().includes(q)
    );
  }, [divisions, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingDivisiId(null);
    setNamaDivisi('');
    setSelectedPejuangIds([]);
    setMemberSearchQuery('');
    setFormError('');
    setHasTwoShifts(false);
    setShift1({
      id: 'shift_1',
      namaShift: 'Shift 1 (Pagi)',
      jamMasuk: '07:00',
      jamPulang: '15:00',
      toleransiMenit: 15
    });
    setShift2({
      id: 'shift_2',
      namaShift: 'Shift 2 (Siang/Sore)',
      jamMasuk: '14:00',
      jamPulang: '22:00',
      toleransiMenit: 15
    });
    setMemberShiftMap({});
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (div: DivisiRecord) => {
    setEditingDivisiId(div.id);
    setNamaDivisi(div.namaDivisi);
    // Find all pejuang currently in this division or in anggotaIds
    const currentMemberIds = new Set([
      ...(div.anggotaIds || []),
      ...accounts.filter(a => a.subDivisi === div.namaDivisi).map(a => a.id)
    ]);
    const membersList = Array.from(currentMemberIds);
    setSelectedPejuangIds(membersList);

    setHasTwoShifts(!!div.hasTwoShifts);
    if (div.shifts && div.shifts.length >= 2) {
      setShift1({
        id: div.shifts[0].id || 'shift_1',
        namaShift: div.shifts[0].namaShift || 'Shift 1 (Pagi)',
        jamMasuk: div.shifts[0].jamMasuk || '07:00',
        jamPulang: div.shifts[0].jamPulang || '15:00',
        toleransiMenit: div.shifts[0].toleransiMenit || 15
      });
      setShift2({
        id: div.shifts[1].id || 'shift_2',
        namaShift: div.shifts[1].namaShift || 'Shift 2 (Siang/Sore)',
        jamMasuk: div.shifts[1].jamMasuk || '14:00',
        jamPulang: div.shifts[1].jamPulang || '22:00',
        toleransiMenit: div.shifts[1].toleransiMenit || 15
      });
    } else {
      setShift1({
        id: 'shift_1',
        namaShift: 'Shift 1 (Pagi)',
        jamMasuk: '07:00',
        jamPulang: '15:00',
        toleransiMenit: 15
      });
      setShift2({
        id: 'shift_2',
        namaShift: 'Shift 2 (Siang/Sore)',
        jamMasuk: '14:00',
        jamPulang: '22:00',
        toleransiMenit: 15
      });
    }

    const sMap: Record<string, string> = {};
    for (const mid of membersList) {
      const user = accounts.find(a => a.id === mid);
      if (user?.assignedShiftId) {
        sMap[mid] = user.assignedShiftId;
      } else {
        sMap[mid] = 'shift_1';
      }
    }
    setMemberShiftMap(sMap);

    setMemberSearchQuery('');
    setFormError('');
    setShowModal(true);
  };

  // Filter members in modal picker
  const filteredPejuangCandidates = useMemo(() => {
    if (!memberSearchQuery.trim()) return pejuangAccounts;
    const q = memberSearchQuery.toLowerCase();
    return pejuangAccounts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.amanah || '').toLowerCase().includes(q) ||
      (p.subDivisi || '').toLowerCase().includes(q)
    );
  }, [pejuangAccounts, memberSearchQuery]);

  // Toggle selection for single pejuang
  const togglePejuang = (id: string) => {
    setSelectedPejuangIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select all / Deselect all
  const handleSelectAllVisible = () => {
    const visibleIds = filteredPejuangCandidates.map(p => p.id);
    const allSelected = visibleIds.every(id => selectedPejuangIds.includes(id));
    if (allSelected) {
      setSelectedPejuangIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedPejuangIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Save Division Handler
  const handleSaveDivisi = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = namaDivisi.trim();
    if (!trimmedName) {
      setFormError('Nama Divisi tidak boleh kosong.');
      return;
    }

    // Duplicate check (case-insensitive)
    const norm = (s: string) => s.toLowerCase().replace(/^(divisi|sub\s*divisi)\s+/i, '').trim();
    const isDuplicate = divisions.some(d =>
      d.id !== editingDivisiId && norm(d.namaDivisi) === norm(trimmedName)
    );

    if (isDuplicate) {
      setFormError(`Divisi dengan nama "${trimmedName}" sudah ada. Gunakan nama lain.`);
      return;
    }

    triggerHapticFeedback(HAPTIC_PATTERNS.LIGHT_TAP);

    const now = new Date().toISOString();
    let updatedDivisions: DivisiRecord[];
    let oldDivisiName: string | null = null;

    if (editingDivisiId) {
      const existing = divisions.find(d => d.id === editingDivisiId);
      if (existing) {
        oldDivisiName = existing.namaDivisi;
      }

      const updatedRecord: DivisiRecord = {
        id: editingDivisiId,
        namaDivisi: trimmedName,
        anggotaIds: selectedPejuangIds,
        hasTwoShifts,
        shifts: hasTwoShifts ? [shift1, shift2] : undefined,
        createdAt: existing?.createdAt || now,
        updatedAt: now
      };

      updatedDivisions = divisions.map(d => d.id === editingDivisiId ? updatedRecord : d);
    } else {
      const newRecord: DivisiRecord = {
        id: `div-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        namaDivisi: trimmedName,
        anggotaIds: selectedPejuangIds,
        hasTwoShifts,
        shifts: hasTwoShifts ? [shift1, shift2] : undefined,
        createdAt: now,
        updatedAt: now
      };
      updatedDivisions = [...divisions, newRecord];
    }

    // Single source of truth update: Sync UserAccount.subDivisi & assignedShiftId
    const updatedAccounts = accounts.map(acc => {
      // If pejuang is selected in this division, set their subDivisi & shift
      if (selectedPejuangIds.includes(acc.id)) {
        const assignedShift = hasTwoShifts ? (memberShiftMap[acc.id] || 'shift_1') : undefined;
        return {
          ...acc,
          subDivisi: trimmedName,
          assignedShiftId: assignedShift
        };
      } else {
        // If pejuang was previously assigned to this division name, reset it
        if (oldDivisiName && acc.subDivisi === oldDivisiName) {
          return { ...acc, subDivisi: '', assignedShiftId: undefined };
        } else if (acc.subDivisi === trimmedName) {
          return { ...acc, subDivisi: '', assignedShiftId: undefined };
        }
      }
      return acc;
    });

    // Sync WorkSchedule references if division was renamed
    let updatedSchedules = schedules;
    if (oldDivisiName && oldDivisiName !== trimmedName) {
      updatedSchedules = schedules.map(sch => {
        if (sch.targetType === 'Divisi') {
          if (sch.targetId === oldDivisiName || sch.targetName === oldDivisiName) {
            return {
              ...sch,
              targetId: trimmedName,
              targetName: trimmedName
            };
          }
        } else if (sch.targetType === 'Group' && sch.divisiIds?.includes(oldDivisiName)) {
          return {
            ...sch,
            divisiIds: sch.divisiIds.map(d => d === oldDivisiName ? trimmedName : d)
          };
        }
        return sch;
      });
      onSaveSchedules(updatedSchedules);
    }

    onSaveDivisions(updatedDivisions);
    onSaveAccounts(updatedAccounts);

    setShowModal(false);
    alert(`Divisi "${trimmedName}" berhasil ${editingDivisiId ? 'diperbarui' : 'ditambahkan'}.`);
  };

  // Delete Division Handler
  const confirmDelete = () => {
    if (!deleteTarget) return;

    triggerHapticFeedback(HAPTIC_PATTERNS.LIGHT_TAP);
    const targetName = deleteTarget.namaDivisi;

    // Remove from divisions
    const updatedDivisions = divisions.filter(d => d.id !== deleteTarget.id);

    // Unassign accounts that had this division
    const updatedAccounts = accounts.map(acc => {
      if (acc.subDivisi === targetName || deleteTarget.anggotaIds?.includes(acc.id)) {
        return { ...acc, subDivisi: '' };
      }
      return acc;
    });

    // Update schedules
    const updatedSchedules = schedules.filter(sch => {
      if (sch.targetType === 'Divisi' && (sch.targetId === targetName || sch.targetName === targetName)) {
        return false; // Remove division schedule or keep? Removing associated division schedule
      }
      return true;
    });

    onSaveDivisions(updatedDivisions);
    onSaveAccounts(updatedAccounts);
    if (updatedSchedules.length !== schedules.length) {
      onSaveSchedules(updatedSchedules);
    }

    setDeleteTarget(null);
    alert(`Divisi "${targetName}" berhasil dihapus.`);
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Manajemen Divisi & Penetapan Anggota Pejuang</span>
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola master divisi pondok. Setiap pejuang yang ditetapkan ke divisi ini otomatis memiliki sub-divisi yang konsisten di seluruh sistem.
          </p>
        </div>

        {isAdmin && (
          <button
            id="btn-tambah-divisi"
            type="button"
            onClick={handleOpenCreate}
            className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Divisi Baru</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama divisi..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Total: {divisions.length} Divisi
        </span>
      </div>

      {/* Grid of Divisions */}
      {filteredDivisions.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400">
          <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
          <p className="text-xs font-semibold">Tidak ada data divisi yang sesuai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDivisions.map((div) => {
            // Count pejuang members dynamically
            const members = accounts.filter(
              a => a.subDivisi === div.namaDivisi || (div.anggotaIds && div.anggotaIds.includes(a.id))
            );

            // Associated schedule
            const schedule = schedules.find(
              s => s.targetType === 'Divisi' && (s.targetId === div.namaDivisi || s.targetName === div.namaDivisi)
            );

            return (
              <div
                key={div.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-400/50 transition-all flex flex-col justify-between space-y-3 relative group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="pr-14">
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                        {div.namaDivisi}
                      </h3>
                      <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{members.length} Anggota Pejuang</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(div)}
                          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Edit Divisi & Anggota"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(div)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hapus Divisi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Associated Schedule / 2-Shift Preview */}
                  <div className="mt-2.5 p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-emerald-500" />
                        <span className="font-semibold">Jadwal Kerja Divisi:</span>
                      </div>
                      {div.hasTwoShifts && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[9px]">
                          2 Shift
                        </span>
                      )}
                    </div>
                    {div.hasTwoShifts && div.shifts && div.shifts.length >= 2 ? (
                      <div className="mt-1.5 space-y-1 text-slate-700 dark:text-slate-200">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">{div.shifts[0].namaShift}:</span>
                          <span className="font-bold">{div.shifts[0].jamMasuk} - {div.shifts[0].jamPulang}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">{div.shifts[1].namaShift}:</span>
                          <span className="font-bold">{div.shifts[1].jamMasuk} - {div.shifts[1].jamPulang}</span>
                        </div>
                      </div>
                    ) : schedule ? (
                      <div className="mt-1 flex items-center justify-between text-slate-700 dark:text-slate-200">
                        <span className="font-bold">{schedule.jamMasuk} - {schedule.jamPulang} WIB</span>
                        <span className="text-[10px] text-slate-400 font-medium">({schedule.hariKerja?.length || 0} Hari)</span>
                      </div>
                    ) : (
                      <span className="mt-1 block text-[10px] text-amber-600 dark:text-amber-400 italic">
                        Belum ada jadwal khusus (mengikuti umum)
                      </span>
                    )}
                  </div>

                  {/* Members preview */}
                  <div className="mt-2.5">
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1">Daftar Anggota:</span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                      {members.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">Belum ada pejuang terdaftar.</span>
                      ) : (
                        members.map(m => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-medium"
                            title={`${m.name} (${m.amanah})`}
                          >
                            {m.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Divisi */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>{editingDivisiId ? 'Edit Divisi & Anggota' : 'Tambah Divisi Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSaveDivisi} className="space-y-4 my-4">
              {/* Input Nama Divisi */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Nama Divisi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaDivisi}
                  onChange={(e) => setNamaDivisi(e.target.value)}
                  placeholder="Contoh: Pondok Pesantren Unit SDIQu"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none font-bold"
                />
              </div>

              {/* 2-Shift System Toggle & Configuration */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasTwoShifts}
                    onChange={(e) => setHasTwoShifts(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-emerald-200">
                      Aktifkan Sistem 2 Shift Kerja untuk Divisi Ini
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                      Contoh: Shift 1 (Pagi) & Shift 2 (Siang/Sore). Anggota dapat dibagi ke masing-masing shift.
                    </span>
                  </div>
                </label>

                {hasTwoShifts && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-emerald-500/20">
                    {/* Shift 1 Config */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Shift 1 (Pagi)</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block">Nama Shift</label>
                        <input
                          type="text"
                          value={shift1.namaShift}
                          onChange={(e) => setShift1({ ...shift1, namaShift: e.target.value })}
                          className="w-full p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block">Masuk</label>
                          <input
                            type="time"
                            value={shift1.jamMasuk}
                            onChange={(e) => setShift1({ ...shift1, jamMasuk: e.target.value })}
                            className="w-full p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block">Pulang</label>
                          <input
                            type="time"
                            value={shift1.jamPulang}
                            onChange={(e) => setShift1({ ...shift1, jamPulang: e.target.value })}
                            className="w-full p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shift 2 Config */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Shift 2 (Siang/Sore)</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block">Nama Shift</label>
                        <input
                          type="text"
                          value={shift2.namaShift}
                          onChange={(e) => setShift2({ ...shift2, namaShift: e.target.value })}
                          className="w-full p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block">Masuk</label>
                          <input
                            type="time"
                            value={shift2.jamMasuk}
                            onChange={(e) => setShift2({ ...shift2, jamMasuk: e.target.value })}
                            className="w-full p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block">Pulang</label>
                          <input
                            type="time"
                            value={shift2.jamPulang}
                            onChange={(e) => setShift2({ ...shift2, jamPulang: e.target.value })}
                            className="w-full p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-Select Anggota Pejuang */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Pilih Anggota Pejuang ({selectedPejuangIds.length} dipilih)
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Pilih / Batalkan Semua
                  </button>
                </div>

                {/* Filter pejuang in picker */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Cari nama pejuang / amanah..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Checklist Container */}
                <div className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 custom-scrollbar">
                  {filteredPejuangCandidates.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Tidak ditemukan pejuang dengan kata kunci tersebut.
                    </div>
                  ) : (
                    filteredPejuangCandidates.map(p => {
                      const isSelected = selectedPejuangIds.includes(p.id);
                      const currentAssignedShift = memberShiftMap[p.id] || 'shift_1';
                      return (
                        <div
                          key={p.id}
                          className={`p-2 rounded-lg text-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                              : 'hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <label className="flex items-center space-x-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePejuang(p.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <span>{p.name}</span>
                              <span className="text-[10px] text-slate-400 block font-normal">
                                {p.amanah} {p.subDivisi ? `• saat ini: ${p.subDivisi}` : ''}
                              </span>
                            </div>
                          </label>

                          {isSelected && hasTwoShifts && (
                            <div className="flex items-center space-x-1 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => setMemberShiftMap(prev => ({ ...prev, [p.id]: 'shift_1' }))}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  currentAssignedShift === 'shift_1'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                Shift 1
                              </button>
                              <button
                                type="button"
                                onClick={() => setMemberShiftMap(prev => ({ ...prev, [p.id]: 'shift_2' }))}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  currentAssignedShift === 'shift_2'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                Shift 2
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  {editingDivisiId ? 'Simpan Perubahan' : 'Tambah Divisi'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal: Delete Division */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-800 dark:text-slate-100"
          >
            <div className="flex items-center space-x-2 text-rose-500 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Konfirmasi Hapus Divisi
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus divisi <strong>"{deleteTarget.namaDivisi}"</strong>?
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/20">
              ⚠️ Anggota yang tergabung dalam divisi ini akan diatur ulang sub-divisinya, dan jadwal kerja khusus divisi ini akan dihapus.
            </p>
            <div className="flex justify-end space-x-2 mt-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Ya, Hapus Divisi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
