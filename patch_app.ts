import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add motion import
if (!content.includes('from "framer-motion"')) {
  content = content.replace(
    /import \{ getHijriDate \} from '\.\/utils\/hijriCalendar';/,
    "import { getHijriDate } from './utils/hijriCalendar';\nimport { AnimatePresence, motion } from 'framer-motion';"
  );
  // wait, the module is motion, so we need to use 'motion/react' or framer-motion if aliased. Let's check what package.json has. It has "motion". So 'motion/react'.
}

content = content.replace(/import \{ AnimatePresence, motion \} from 'framer-motion';/, "import { AnimatePresence, motion } from 'motion/react';");

const appReplacement = `
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            {activeTab === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                accounts={accounts}
                attendance={attendance}
                exitPermissions={exitPermissions}
                leaveRequests={leaveRequests}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === 'izin' && (
              <IzinKeluarView
                currentUser={currentUser}
                accounts={accounts}
                exitPermissions={exitPermissions}
                onSaveExitPermissions={handleSaveExitPermissions}
              />
            )}
            {activeTab === 'absensi' && (
              <AbsensiView
                currentUser={currentUser}
                attendance={attendance}
                locationSettings={locationSettings || INITIAL_LOCATION_SETTINGS}
                schedules={schedules}
                onSaveAttendance={handleSaveAttendance}
              />
            )}
            {activeTab === 'cuti' && (
              <CutiView
                currentUser={currentUser}
                accounts={accounts}
                leaveRequests={leaveRequests}
                onSaveLeaveRequests={handleSaveLeaveRequests}
              />
            )}
            {activeTab === 'ubar' && (
              <SlipUbarView
                currentUser={currentUser}
                accounts={accounts}
                slipUbarList={slipUbarList}
                onSaveSlipUbar={handleSaveSlipUbar}
              />
            )}
            {activeTab === 'sp' && (
              <SuratTeguranView
                currentUser={currentUser}
                accounts={accounts}
                warningLetters={warningLetters}
                onSaveWarningLetters={handleSaveWarningLetters}
              />
            )}
            {activeTab === 'kalender' && (
              <KalenderView 
                leaveRequests={leaveRequests} 
                accounts={accounts} 
                currentUser={currentUser} 
              />
            )}
            {activeTab === 'laporan' && (
              <LaporanView
                currentUser={currentUser}
                accounts={accounts}
                attendance={attendance}
                exitPermissions={exitPermissions}
                leaveRequests={leaveRequests}
                warningLetters={warningLetters}
                slipUbarList={slipUbarList}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView
                currentUser={currentUser}
                accounts={accounts}
                locationSettings={locationSettings || INITIAL_LOCATION_SETTINGS}
                schedules={schedules}
                manhajiyyahClauses={manhajiyyahClauses}
                onSaveLocationSettings={handleSaveLocationSettings}
                onSaveSchedules={handleSaveSchedules}
                onSaveAccounts={handleSaveAccounts}
                onSaveManhajiyyahClauses={handleSaveManhajiyyahClauses}
              />
            )}
          </motion.div>
        </AnimatePresence>
`;

content = content.replace(
  /\{activeTab === 'dashboard'[\s\S]*\}\s*<\/IOSGlassLayout>/,
  appReplacement.trim() + '\n      </IOSGlassLayout>'
);

fs.writeFileSync('src/App.tsx', content);
