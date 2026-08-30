import { useEffect, useRef } from 'react';
import { UserAccount, LeaveRequestRecord } from '../types';

export function useCutiReminder(
  currentUser: UserAccount | null,
  leaveRequests: LeaveRequestRecord[],
  jenisCutiList: { id: string; name: string; maxDays: number; }[] = []
) {
  const hasReminded = useRef(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Pejuang') return;
    if (hasReminded.current) return;

    let maxCutiTahunan = 12;
    const cutiTahunanSetting = jenisCutiList.find(j => j.name === 'Cuti Tahunan');
    if (cutiTahunanSetting) {
      maxCutiTahunan = cutiTahunanSetting.maxDays;
    }

    const currentYear = new Date().getFullYear();
    const annualLeaves = leaveRequests.filter(l => 
      l.pejuangId === currentUser.id && 
      l.jenisCuti === 'Cuti Tahunan' && 
      l.status === 'Disetujui' &&
      l.tanggalMulai.startsWith(currentYear.toString())
    );

    const totalUsed = annualLeaves.reduce((acc, curr) => acc + curr.totalHari, 0);
    const sisa = Math.max(0, maxCutiTahunan - totalUsed);

    if (sisa <= 3) {
      hasReminded.current = true;
      
      // We only remind once per session load
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('Pengingat Saldo Cuti', {
            body: `Saldo cuti tahunan Anda tersisa ${sisa} hari lagi. Rencanakan cuti Anda dengan baik.`,
            icon: '/vite.svg'
          });
        }
      }, 5000);
    }

  }, [currentUser, leaveRequests, jenisCutiList]);
}
