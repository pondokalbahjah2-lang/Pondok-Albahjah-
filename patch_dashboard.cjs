const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const importOld = `  WarningLetterRecord,
} from '../types';
import { PrayerTimesWidget } from './PrayerTimesWidget';`;
const importNew = `  WarningLetterRecord,
  ManhajiyyahClause
} from '../types';
import { getDailyClauseIndex } from '../utils/hijriCalendar';
import { PrayerTimesWidget } from './PrayerTimesWidget';`;

if (code.includes(importOld)) {
  code = code.replace(importOld, importNew);
} else {
  console.log('importOld not found');
}

const interfaceOld = `interface DashboardViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  attendance: AttendanceRecord[];
  exitPermissions: ExitPermissionRecord[];
  leaveRequests: LeaveRequestRecord[];
  warningLetters: WarningLetterRecord[];
  onNavigate: (tab: string) => void;
}`;
const interfaceNew = `interface DashboardViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  attendance: AttendanceRecord[];
  exitPermissions: ExitPermissionRecord[];
  leaveRequests: LeaveRequestRecord[];
  warningLetters: WarningLetterRecord[];
  manhajiyyahClauses: ManhajiyyahClause[];
  onNavigate: (tab: string) => void;
}`;

if (code.includes(interfaceOld)) {
  code = code.replace(interfaceOld, interfaceNew);
} else {
  console.log('interfaceOld not found');
}

const componentOld = `export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  accounts,
  attendance,
  exitPermissions,
  leaveRequests,
  warningLetters,
  onNavigate,
}) => {`;
const componentNew = `export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  accounts,
  attendance,
  exitPermissions,
  leaveRequests,
  warningLetters,
  manhajiyyahClauses,
  onNavigate,
}) => {
  const dailyClauseIndex = getDailyClauseIndex(manhajiyyahClauses?.length || 0, new Date());
  const clauseToday = manhajiyyahClauses ? (manhajiyyahClauses[dailyClauseIndex] || manhajiyyahClauses[0]) : null;
`;

if (code.includes(componentOld)) {
  code = code.replace(componentOld, componentNew);
} else {
  console.log('componentOld not found');
}

const headerOld = `          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 rounded-lg p-2 max-w-md">
            <div className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
              Pasal Manhajiyyah Hari Ini:
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Pasal {new Date().getDate() % 10 || 1}: Tetap istiqomah dalam melayani ummat dengan ikhlas dan sabar.
            </p>
          </div>`;
const headerNew = `          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 rounded-lg p-2 max-w-md">
            <div className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
              Pasal Manhajiyyah Hari Ini:
            </div>
            {clauseToday ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 line-clamp-2" title={clauseToday.content}>
                <strong>Pasal {clauseToday.pasalNumber}: {clauseToday.title}</strong> - "{clauseToday.content}"
              </p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Memuat Pasal Manhajiyyah...
              </p>
            )}
          </div>`;

if (code.includes(headerOld)) {
  code = code.replace(headerOld, headerNew);
} else {
  console.log('headerOld not found');
}

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('DashboardView patched');
