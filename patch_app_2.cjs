const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Update checkSchedule to include jamPulang
const oldCheckSchedule = `    const checkSchedule = () => {
      if (Notification.permission !== 'granted') return;
      
      const now = new Date();
      const currentDayIndex = now.getDay(); // 0 = Ahad
      const days = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const todayStr = days[currentDayIndex];
      
      // Find user's schedule
      const sched = schedules.find(s => s.targetDivisi === currentUser.subDivisi) || 
                    schedules.find(s => s.targetDivisi === 'Semua Divisi');
      
      if (sched && sched.hariKerja.includes(todayStr) && sched.jamMasuk) {
        // Parse shift start time
        const [shiftHour, shiftMin] = sched.jamMasuk.split(':').map(Number);
        
        // Target shift time today
        const shiftTime = new Date();
        shiftTime.setHours(shiftHour, shiftMin, 0, 0);
        
        // Check if now is exactly 15 mins before
        const diffMs = shiftTime.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        // We trigger it if the difference is exactly 15 minutes
        if (diffMins === 15) {
          // Send notification
          const msg = \`Waktu shift kerja Anda untuk \${sched.targetDivisi} akan dimulai 15 menit lagi pada pukul \${sched.jamMasuk}.\`;
          new Notification('Pengingat Jadwal Masuk', { body: msg });
        }
      }
    };`;

const newCheckSchedule = `    const checkSchedule = () => {
      if (Notification.permission !== 'granted') return;
      
      const now = new Date();
      const currentDayIndex = now.getDay(); // 0 = Ahad
      const days = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const todayStr = days[currentDayIndex];
      
      // Find user's schedule
      const sched = schedules.find(s => s.targetDivisi === currentUser.subDivisi) || 
                    schedules.find(s => s.targetDivisi === 'Semua Divisi');
      
      if (sched && sched.hariKerja.includes(todayStr)) {
        if (sched.jamMasuk) {
          const [shiftHour, shiftMin] = sched.jamMasuk.split(':').map(Number);
          const shiftTime = new Date();
          shiftTime.setHours(shiftHour, shiftMin, 0, 0);
          
          const diffMs = shiftTime.getTime() - now.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          
          if (diffMins === 15) {
            const msg = \`Waktu shift kerja Anda untuk \${sched.targetDivisi} akan dimulai 15 menit lagi pada pukul \${sched.jamMasuk}.\`;
            new Notification('Pengingat Jadwal Masuk', { body: msg });
          }
        }
        
        if (sched.jamPulang) {
          const [outHour, outMin] = sched.jamPulang.split(':').map(Number);
          const outTime = new Date();
          outTime.setHours(outHour, outMin, 0, 0);
          
          const diffMs = outTime.getTime() - now.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          
          if (diffMins === 15) {
            const msg = \`Waktu shift pulang Anda untuk \${sched.targetDivisi} adalah 15 menit lagi pada pukul \${sched.jamPulang}. Jangan lupa absen pulang!\`;
            new Notification('Pengingat Jadwal Pulang', { body: msg });
          }
        }
      }
    };`;

content = content.replace(oldCheckSchedule, newCheckSchedule);

// Inject Welcome Modal at the very end of the file before `</>`
// Check if the modal already exists
if (!content.includes('Manhajiyyah Hari Ini (1 Pasal 1 Hari)')) {
  const modalHTML = `
      {showWelcomeManhajiyyah && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full flex flex-col shadow-2xl text-slate-100"
          >
            <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-3">
              <BookOpen className="w-5 h-5" />
              <span>Manhajiyyah Hari Ini (1 Pasal 1 Hari)</span>
            </div>
            {manhajiyyahClauses && manhajiyyahClauses.length > 0 ? (
              <div className="space-y-4 my-2">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                  Pasal {manhajiyyahClauses[(new Date().getDate() - 1) % manhajiyyahClauses.length].pasalNumber}: {manhajiyyahClauses[(new Date().getDate() - 1) % manhajiyyahClauses.length].title}
                </div>
                <h3 className="text-lg font-bold text-white">{manhajiyyahClauses[(new Date().getDate() - 1) % manhajiyyahClauses.length].category}</h3>
                <p className="text-sm text-slate-200 leading-relaxed italic border-l-4 border-emerald-500 pl-4 py-1">
                  "{manhajiyyahClauses[(new Date().getDate() - 1) % manhajiyyahClauses.length].content}"
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Belum ada pasal Manhajiyyah.</p>
            )}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowWelcomeManhajiyyah(false)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-bold text-sm shadow-lg shadow-emerald-600/20"
              >
                Lanjutkan ke Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
`;
  content = content.replace(/<\/>\n\s*\);\n};/g, modalHTML);
}

fs.writeFileSync(file, content);
console.log("Patched App.tsx successfully.");
