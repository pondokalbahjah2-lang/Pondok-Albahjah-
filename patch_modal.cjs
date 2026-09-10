const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

// 1. Update activeListModal type
content = content.replace(
  "const [activeListModal, setActiveListModal] = useState<'hadir' | 'terlambat' | 'sakit' | 'libur' | 'belumAbsen' | null>(null);",
  "const [activeListModal, setActiveListModal] = useState<'hadir' | 'terlambat' | 'sakit' | 'libur' | 'belumAbsen' | 'izinTdkMasuk' | 'pengajuanCuti' | 'sedangCuti' | null>(null);"
);

// 2. Add leave request lists to todayStats
const todayStatsStr = `    const belumAbsenList = pejuangs.filter(p => !attendeesIds.has(p.id));`;
const newLists = `    const belumAbsenList = pejuangs.filter(p => !attendeesIds.has(p.id));
    const pengajuanCutiList = leaveRequests.filter(l => l.status === 'Menunggu Persetujuan');
    const sedangCutiList = leaveRequests.filter(l => l.status === 'Sedang Cuti');`;
content = content.replace(todayStatsStr, newLists);

const listsStr = `        izinTdkMasuk: izinList,
        belumAbsen: belumAbsenList
      }
    };
  }, [attendance, accounts]);`;
const newListsStr = `        izinTdkMasuk: izinList,
        belumAbsen: belumAbsenList,
        pengajuanCuti: pengajuanCutiList,
        sedangCuti: sedangCutiList
      }
    };
  }, [attendance, accounts, leaveRequests]);`;
content = content.replace(listsStr, newListsStr);

fs.writeFileSync('src/components/DashboardView.tsx', content);
