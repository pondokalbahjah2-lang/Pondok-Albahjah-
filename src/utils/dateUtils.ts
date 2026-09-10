import { UserAccount } from '../types';

export const getLocalDateString = (d: Date = new Date()) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getLogicalAttendanceDateStr = (user?: UserAccount, d: Date = new Date()) => {
  if (user) {
    const sub = (user.subDivisi || '').toLowerCase();
    const isNightShift = sub.includes('banat') || 
                         sub.includes('sdiqu') || 
                         sub.includes('smpiqu') || 
                         sub.includes('smaiqu');
    
    // If it's a night shift and the time is before 09:00 AM (giving some buffer after 07:00), 
    // it counts as the previous day's shift
    if (isNightShift && d.getHours() < 9) {
      const prevDate = new Date(d);
      prevDate.setDate(prevDate.getDate() - 1);
      return getLocalDateString(prevDate);
    }
  }
  return getLocalDateString(d);
};
