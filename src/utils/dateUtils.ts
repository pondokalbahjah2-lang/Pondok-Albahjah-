import { UserAccount } from '../types';

export const getLocalDateString = (d: Date = new Date()) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getLogicalAttendanceDateStr = (user?: UserAccount, d: Date = new Date()) => {
  const nightShiftDivisions = ['Kepondokan Banat', 'Pondok Unit SDIQu', 'SMPIQu', 'SMAIQu'];
  if (user && nightShiftDivisions.includes(user.subDivisi)) {
    // If it's before 07:00 AM, it counts as the previous day's shift
    if (d.getHours() < 7) {
      const prevDate = new Date(d);
      prevDate.setDate(prevDate.getDate() - 1);
      return getLocalDateString(prevDate);
    }
  }
  return getLocalDateString(d);
};
