import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const effectCode = `
  // Auto Pulang Reminder
  useEffect(() => {
    if (!currentUser || currentUser.role === 'Admin') return;
    
    let intervalId: NodeJS.Timeout;
    
    const checkPulangReminder = () => {
      const userSchedule = schedules.find(
        (s) => s.targetName.includes(currentUser.subDivisi) || s.targetId === currentUser.id
      ) || schedules[0];
      
      if (!userSchedule || !userSchedule.jamPulang) return;
      
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      
      const [scheduleHour, scheduleMin] = userSchedule.jamPulang.split(':').map(Number);
      
      const currentTimeInMins = currentHour * 60 + currentMin;
      const scheduleTimeInMins = scheduleHour * 60 + scheduleMin;
      
      // Check if 15 minutes before
      if (scheduleTimeInMins - currentTimeInMins === 15) {
        // Also check if already clocked out to avoid annoying them
        const dateStr = now.toISOString().split('T')[0];
        const todayRecord = attendance.find(a => a.date === dateStr && a.pejuangId === currentUser.id);
        if (todayRecord && todayRecord.timePulang) return; // already clocked out
        
        // Use browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
           new Notification('Pengingat Jam Pulang', {
             body: \`Halo \${currentUser.name}, jam pulang Anda (\${userSchedule.jamPulang}) tinggal 15 menit lagi. Jangan lupa presensi pulang ya!\`,
             icon: '/icon.png'
           });
        }
      }
    };
    
    // Check every minute
    intervalId = setInterval(checkPulangReminder, 60000);
    // Initial check
    checkPulangReminder();
    
    return () => clearInterval(intervalId);
  }, [currentUser, schedules, attendance]);

  const handleLogin = (user: UserAccount) => {
`;

content = content.replace(/const handleLogin = \(user: UserAccount\) => \{/, effectCode.trim() + '\n\n  const handleLogin = (user: UserAccount) => {');

fs.writeFileSync('src/App.tsx', content);
