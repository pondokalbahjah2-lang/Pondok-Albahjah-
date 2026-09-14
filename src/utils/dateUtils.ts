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
    
    // Only count as yesterday if it's before 5:00 AM. 
    // Normal morning shifts often start around 06:00 or 07:00, so we shouldn't shift them to yesterday.
    if (isNightShift && d.getHours() < 5) {
      const prevDate = new Date(d);
      prevDate.setDate(prevDate.getDate() - 1);
      return getLocalDateString(prevDate);
    }
  }
  return getLocalDateString(d);
};
