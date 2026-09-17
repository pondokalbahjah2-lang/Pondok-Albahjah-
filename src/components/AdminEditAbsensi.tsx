import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../utils/firebase';
import { AttendanceRecord } from '../types';
import { Search, Save, X, Edit, Calendar } from 'lucide-react';

interface AdminEditAbsensiProps {
  onClose: () => void;
}

export const AdminEditAbsensi: React.FC<AdminEditAbsensiProps> = ({ onClose }) => {
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState<AttendanceRecord['status']>('Hadir');
  const [editTime, setEditTime] = useState('');
  const [editTimePulang, setEditTimePulang] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [targetDate]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'attendance'), where('date', '==', targetDate));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord));
      setRecords(data);
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'attendance');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditDate(record.date);
    setEditStatus(record.status);
    setEditTime(record.time);
    setEditTimePulang(record.timePulang || '');
  };

  const saveEdit = async (id: string) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'attendance', id), {
        date: editDate,
        status: editStatus,
        time: editTime,
        timePulang: editTimePulang || null,
      });
      setEditingId(null);
      alert('Berhasil menyimpan perubahan!');
      fetchRecords();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `attendance/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.6 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Edit className="w-5 h-5 text-emerald-600" />
            <span>Perbaikan Data Absensi</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-4 items-center">
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1">Pilih Tanggal Saat Ini:</label>
            <input 
              type="date" 
              value={targetDate} 
              onChange={e => setTargetDate(e.target.value)}
              className="px-3 py-2 rounded-xl border text-sm"
            />
          </div>
          <button onClick={fetchRecords} className="mt-5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex gap-2 items-center">
            <Search className="w-4 h-4" /> Cari
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <p className="text-center p-4">Memuat data...</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase">
                  <th className="p-2">Nama</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Tanggal</th>
                  <th className="p-2">Jam Masuk</th>
                  <th className="p-2">Jam Pulang</th>
                  <th className="p-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {records.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-2 font-medium">{r.pejuangName}</td>
                    
                    {editingId === r.id ? (
                      <>
                        <td className="p-2">
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value as any)} className="w-full p-1 border rounded">
                            <option value="Hadir">Hadir</option>
                            <option value="Terlambat">Terlambat</option>
                            <option value="Sakit">Sakit</option>
                            <option value="Izin">Izin</option>
                            <option value="Libur">Libur</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full p-1 border rounded" />
                        </td>
                        <td className="p-2">
                          <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} className="w-full p-1 border rounded" />
                        </td>
                        <td className="p-2">
                          <input type="time" value={editTimePulang} onChange={e => setEditTimePulang(e.target.value)} className="w-full p-1 border rounded" />
                        </td>
                        <td className="p-2">
                          <button onClick={() => saveEdit(r.id)} className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold">Simpan</button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-300 ml-2 text-slate-800 px-2 py-1 rounded text-xs font-bold">Batal</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">{r.status}</td>
                        <td className="p-2">{r.date}</td>
                        <td className="p-2">{r.time}</td>
                        <td className="p-2">{r.timePulang || '-'}</td>
                        <td className="p-2">
                          <button onClick={() => startEdit(r)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">Edit</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
};
