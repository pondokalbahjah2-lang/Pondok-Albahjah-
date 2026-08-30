import { useEffect, useRef } from 'react';
import { UserAccount, WorkSchedule, AttendanceRecord } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

export function usePulangReminder(
  currentUser: UserAccount | null,
  schedules: WorkSchedule[],
  attendance: AttendanceRecord[]
) {
  const hasReminded = useRef(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Pejuang') return;

    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = getLocalDateString(now);
      
      // Get today's attendance
      const todayRecord = attendance.find(
        (a) => a.pejuangId === currentUser.id && a.date === todayStr
      );

      // If no attendance today, or already clocked out, or marked as Libur/Sakit, we don't remind
      if (!todayRecord || todayRecord.timePulang || todayRecord.status === 'Libur' || todayRecord.status === 'Sakit') {
        return;
      }

      // Find applicable schedule
      let activeSchedule = schedules.find((s) => s.targetType === 'Individu' && s.targetId === currentUser.id);
      if (!activeSchedule) {
        activeSchedule = schedules.find((s) => s.targetType === 'Divisi' && s.targetId === currentUser.subDivisi);
      }

      if (activeSchedule && activeSchedule.jamPulang) {
        const [hourStr, minStr] = activeSchedule.jamPulang.split(':');
        const targetTime = new Date(now);
        targetTime.setHours(parseInt(hourStr, 10), parseInt(minStr, 10), 0, 0);

        // 30 minutes before jamPulang
        const reminderTime = new Date(targetTime.getTime() - 30 * 60000);
        
        // if now is after reminderTime but before targetTime + 1 hour, and we haven't reminded yet
        if (now >= reminderTime && now <= new Date(targetTime.getTime() + 60 * 60000) && !hasReminded.current) {
          hasReminded.current = true;
          
          // Trigger browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification('Pengingat Absen Pulang', {
              body: 'Waktu pulang kerja tersisa 30 menit lagi. Jangan lupa untuk melakukan absen pulang di sistem.',
              icon: '/vite.svg'
            });
          }
          
          // Fallback to in-app alert or custom event if needed
          // But since they might not be actively looking, standard Notification is best
        }
      }
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, [currentUser, schedules, attendance]);
}
