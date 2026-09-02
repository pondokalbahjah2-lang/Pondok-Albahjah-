import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, Legend, PieChart, Pie
} from 'recharts';
import { getLocalDateString } from '../utils/dateUtils';
import { AttendanceRecord, UserAccount } from '../types';
import { BarChart3 as BarChartIcon, PieChart as PieChartIcon } from 'lucide-react';

interface DashboardSummaryChartProps {
  currentUser: UserAccount;
  attendance: AttendanceRecord[];
}

export const DashboardSummaryChart: React.FC<DashboardSummaryChartProps> = ({ currentUser, attendance }) => {
  // Weekly trend data
  const last7DaysData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      
      const record = attendance.find(a => a.pejuangId === currentUser.id && a.date === dateStr);
      let statusVal = 0;
      let fill = '#e2e8f0'; 
      
      if (record) {
        if (record.status === 'Hadir') { statusVal = 1; fill = '#10b981'; } 
        else if (record.status === 'Terlambat') { statusVal = 1; fill = '#f59e0b'; } 
        else if (record.status === 'Sakit') { statusVal = 1; fill = '#3b82f6'; } 
      }
      
      data.push({
        name: dayName,
        date: dateStr,
        status: record ? record.status : 'Belum/Libur',
        value: statusVal,
        fill
      });
    }
    return data;
  }, [attendance, currentUser.id]);

  const monthStats = React.useMemo(() => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    
    let hadir = 0;
    let terlambat = 0;
    let sakit = 0;
    
    attendance.forEach(a => {
      if (a.pejuangId === currentUser.id) {
        const d = new Date(a.date);
        if (d >= lastMonth && d <= today) {
          if (a.status === 'Hadir') hadir++;
          else if (a.status === 'Terlambat') terlambat++;
          else if (a.status === 'Sakit') sakit++;
        }
      }
    });
    
    return [
      { name: 'Hadir', value: hadir, color: '#10b981' },
      { name: 'Terlambat', value: terlambat, color: '#f59e0b' },
      { name: 'Sakit', value: sakit, color: '#3b82f6' },
    ].filter(d => d.value > 0);
  }, [attendance, currentUser.id]);

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChartIcon className="w-4 h-4 text-emerald-500" />
            Tren Kehadiran (7 Hari Terakhir)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis hide />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-xl border border-slate-700">
                          <p className="font-bold mb-1">{data.date}</p>
                          <p>Status: <span style={{ color: data.fill }}>{data.status}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {last7DaysData.map((entry, index) => (
                    <Cell key={`bar-cell-\${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-emerald-500" />
            Statistik Kehadiran (30 Hari Terakhir)
          </h3>
          {monthStats.length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={monthStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {monthStats.map((entry, index) => (
                      <Cell key={`pie-cell-\${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-xl border border-slate-700">
                            <p className="font-bold">{data.name}: {data.value} hari</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-slate-500 font-bold">
              Belum ada data absensi dalam 30 hari terakhir.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
