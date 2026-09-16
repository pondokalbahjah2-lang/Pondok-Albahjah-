import { UserAccount } from '../types';

export const getLocalDateString = (d: Date = new Date()) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getLogicalAttendanceDateStr = (user?: UserAccount, d: Date = new Date()) => {
  return getLocalDateString(d);
};
