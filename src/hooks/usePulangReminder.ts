import { useEffect, useRef } from 'react';
import { UserAccount, WorkSchedule, AttendanceRecord, DivisiRecord } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { getEffectiveWorkHours } from '../utils/shiftUtils';

export function usePulangReminder(
  currentUser: UserAccount | null,
  schedules: WorkSchedule[],
  attendance: AttendanceRecord[],
  divisions: DivisiRecord[] = []
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

      // Use helper to get effective work hours (supports 2-shift division & schedule fallback)
      const effectiveWork = getEffectiveWorkHours(currentUser, divisions, schedules);

      if (effectiveWork && effectiveWork.jamPulang) {
        const [hourStr, minStr] = effectiveWork.jamPulang.split(':');
        const targetTime = new Date(now);
        targetTime.setHours(parseInt(hourStr, 10), parseInt(minStr, 10), 0, 0);

        // 30 minutes before jamPulang
        const reminderTime = new Date(targetTime.getTime() - 30 * 60000);
        
        // if now is after reminderTime but before targetTime + 1 hour, and we haven't reminded yet
        if (now >= reminderTime && now <= new Date(targetTime.getTime() + 60 * 60000) && !hasReminded.current) {
          hasReminded.current = true;
          
          // Trigger browser notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('Pengingat Absen Pulang', {
                body: `Waktu pulang kerja (${effectiveWork.jamPulang}) tersisa 30 menit lagi. Jangan lupa untuk melakukan absen pulang di sistem.`,
                icon: '/vite.svg'
              });
            } catch (err) {
              console.warn('Notification error:', err);
            }
          }
        }
      }
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, [currentUser, schedules, attendance, divisions]);
}
