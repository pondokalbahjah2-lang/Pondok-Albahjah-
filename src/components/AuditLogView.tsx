import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Calendar, Search, Filter } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO String
  action: string;
  adminName: string;
  details: string;
}

interface AuditLogViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = React.useMemo(() => {
    return logs
      .filter(l => 
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.details.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
            Audit Logs (Riwayat Sistem)
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Rekam jejak seluruh tindakan dan perubahan di dalam sistem oleh Admin.
          </p>
        </div>
      </div>

      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="rounded-2xl p-[2px] bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm"
      >
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari aktivitas, nama admin, atau detail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 w-full placeholder-slate-400"
          />
        </div>
      </motion.div>

      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Waktu</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Tindakan</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Oleh</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {log.adminName}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada data log yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
