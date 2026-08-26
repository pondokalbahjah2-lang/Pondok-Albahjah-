import { HijriDate } from '../types';

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi’ul Awwal',
  'Rabi’ul Akhir',
  'Jumadil Awwal',
  'Jumadil Akhir',
  'Rajab',
  'Sha’ban',
  'Ramadhan',
  'Syawwal',
  'Dzulqa’dah',
  'Dzulhijjah',
];

/**
 * Kuwaiti Algorithm conversion from Gregorian date to Hijri date
 */
export function getHijriDate(date: Date = new Date()): HijriDate {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5;

  const islamicEpoch = 1948439.5;
  const daysSinceEpoch = jd - islamicEpoch;
  const cycleNumber = Math.floor(daysSinceEpoch / 10631);
  let daysInCycle = daysSinceEpoch - cycleNumber * 10631;

  let yearInCycle = Math.floor((daysInCycle - 0.5) / 325.25);
  if (yearInCycle < 0) yearInCycle = 0;

  const hijriYear = cycleNumber * 30 + yearInCycle + 1;

  let daysInHijriYear =
    daysInCycle - Math.floor(yearInCycle * 354.3666666666667);
  if (daysInHijriYear < 0) daysInHijriYear = 0;

  let hijriMonth = Math.floor((daysInHijriYear + 29.5) / 29.5);
  if (hijriMonth > 12) hijriMonth = 12;
  if (hijriMonth < 1) hijriMonth = 1;

  let hijriDay = Math.floor(daysInHijriYear - Math.floor((hijriMonth - 1) * 29.5) + 1);
  if (hijriDay < 1) hijriDay = 1;
  if (hijriDay > 30) hijriDay = 30;

  const monthName = HIJRI_MONTHS[hijriMonth - 1];

  return {
    day: hijriDay,
    monthName,
    monthNumber: hijriMonth,
    year: hijriYear,
    formatted: `${hijriDay} ${monthName} ${hijriYear} H`,
  };
}

export function formatMasehiDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Calculates a rotating clause index based on the day of the year
 */
export function getDailyClauseIndex(totalClauses: number, date: Date = new Date()): number {
  if (totalClauses === 0) return 0;
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear % totalClauses;
}
