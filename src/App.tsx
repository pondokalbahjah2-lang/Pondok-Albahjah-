import React, { useState, useEffect } from 'react';
import { UserAccount, AttendanceRecord, ExitPermissionRecord, LeaveRequestRecord, WarningLetterRecord, SlipUbarRecord, WorkSchedule, LocationSettings, ManhajiyyahClause, GeneralSettings } from './types';
import { Storage as AppStorage } from './utils/storage';
import { IOSGlassLayout } from './components/iOSGlassLayout';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { IzinKeluarView } from './components/IzinKeluarView';
import { AbsensiView } from './components/AbsensiView';
import { CutiView } from './components/CutiView';
import { SlipUbarView } from './components/SlipUbarView';
import { SuratTeguranView } from './components/SuratTeguranView';
import { KalenderView } from './components/KalenderView';
import { LaporanView } from './components/LaporanView';
import { SettingsView } from './components/SettingsView';
import { OnboardingModal } from './components/OnboardingModal';
import { db, auth, handleFirestoreError, OperationType } from './utils/firebase';
import { collection, onSnapshot, query, where, setDoc, doc, getDocs, limit, orderBy, deleteDoc, writeBatch } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { messaging } from './utils/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { RefreshCcw, AlertTriangle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { INITIAL_LOCATION_SETTINGS } from './data/mockData';

export default function App() {
  console.log('App: Component rendering...');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [exitPermissions, setExitPermissions] = useState<ExitPermissionRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestRecord[]>([]);
  const [warningLetters, setWarningLetters] = useState<WarningLetterRecord[]>([]);
  const [slipUbarList, setSlipUbarList] = useState<SlipUbarRecord[]>([]);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({});
  const [locationSettings, setLocationSettings] = useState<LocationSettings | null>(null);
  const [manhajiyyahClauses, setManhajiyyahClauses] = useState<ManhajiyyahClause[]>([]);
  
  const [showDesyncBanner, setShowDesyncBanner] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  

  


  // GLOBAL PUBLIC SYNC HOOK (No Auth Required)
  useEffect(() => {
    // Sync General Settings
    const unsubGeneral = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setGeneralSettings(docSnap.data() as GeneralSettings);
      }
    }, (err) => console.log('Settings read err'));

    // Sync Manhajiyyah Clauses
    let firstManhajLoad = true;
    const unsubManhaj = onSnapshot(collection(db, 'manhajiyyahClauses'), (snap) => {
      if (!firstManhajLoad && currentUser?.role !== 'Admin') {
         snap.docChanges().forEach(change => {
           if (change.type === 'added' || change.type === 'modified') {
             const newData = change.doc.data();
             const msg = change.type === 'added' 
               ? `Pasal Manhajiyyah Baru Ditambahkan: ${newData.bab} - ${newData.title}`
               : `Pasal Manhajiyyah Diperbarui: ${newData.title}`;
             
             if (Notification.permission === 'granted') {
                new Notification('Pembaruan Manhajiyyah', { body: msg });
             }
             alert(msg);
           }
         });
      }
      setManhajiyyahClauses(snap.docs.map(d => d.data() as ManhajiyyahClause));
      firstManhajLoad = false;
    }, (err) => console.log('Manhajiyyah read err'));

    return () => {
      unsubGeneral();
      unsubManhaj();
    };
  }, [currentUser?.role]); // re-bind when role changes so the notification logic uses correct role

  // FIREBASE SYNC HOOK
  useEffect(() => {
    console.log('App: useEffect for Firebase Sync triggered. Current user:', currentUser?.id);
    if (!currentUser) {
      console.log('App: No currentUser in state, skipping sync.');
      return;
    }

    let unsubUsers = () => {};
    let unsubAtt = () => {};
    let unsubExit = () => {};
    let unsubLeave = () => {};
    let unsubWarn = () => {};
    let unsubSlip = () => {};

    let unsubSchedules = () => {};
    let unsubLoc = () => {};
    let unsubManhaj = () => {};

    console.log('App: Setting up onAuthStateChanged listener');
    const unsubAuth = onAuthStateChanged(auth, async (fUser) => {
      console.log('App: onAuthStateChanged callback fired. Firebase User:', fUser?.uid);
      if (fUser) {
        let activeUser = currentUser;
        if (!activeUser) {
          try {
            const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', fUser.email)));
            if (!userDoc.empty) {
              activeUser = userDoc.docs[0].data();
              setCurrentUser(activeUser);
              setActiveTab(activeUser.role === 'Admin' ? 'dashboard' : 'absensi');
            }
          } catch (e) { console.error('Failed to restore user session:', e); }
        }
        if (!activeUser) return;
        console.log('App: Firebase User is authenticated. Proceeding with sync.');
        const isAd = activeUser.role === 'Admin';
        const uid = activeUser.id;

        // Setup FCM
        if (messaging) {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              getToken(messaging, { vapidKey: 'BOwz_3T9gqIq7E5s4K55-1m7Xk60k5W-8b3q2-Gv43S9kR330lqQ4T3tQh9-w3qVv7RzU7v8YxY8bM9W0r0_eLw' }).then((currentToken) => {
                if (currentToken) {
                  // Save token to user doc
                  setDoc(doc(db, 'fcmTokens', uid), { token: currentToken, userId: uid }, { merge: true });
                }
              }).catch((err) => {
                console.log('An error occurred while retrieving token. ', err);
              });
            }
          });

          onMessage(messaging, (payload) => {
            if (payload.notification) {
              alert(`Pemberitahuan Baru: ${payload.notification.title}\n${payload.notification.body}`);
            }
          });
        }

        // Sync Users
        const usersQ = isAd ? collection(db, 'users') : query(collection(db, 'users'), where('id', '==', uid));
        unsubUsers = onSnapshot(usersQ, (snap) => {
          const data = snap.docs.map(d => d.data() as UserAccount);
          setAccounts(prev => isAd ? data : [...prev.filter(p => p.id !== uid), ...data]);
          
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

        // Sync Attendance
        const attQ = isAd 
          ? query(collection(db, 'attendance'), limit(1000))
          : query(collection(db, 'attendance'), where('pejuangId', '==', uid), limit(100));
        unsubAtt = onSnapshot(attQ, (snap) => {
          let data = snap.docs.map(d => d.data() as any);
          if (!isAd) {
            data = data.sort((a: any, b: any) => new Date(b.date || b.tanggal || 0).getTime() - new Date(a.date || a.tanggal || 0).getTime());
          }
          setAttendance(data);
          
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'attendance'));

        // Sync Exit Permissions
        const exitQ = isAd 
          ? query(collection(db, 'exitPermissions'), limit(500))
          : query(collection(db, 'exitPermissions'), where('pejuangId', '==', uid), limit(50));
        let firstExitLoad = true;
        unsubExit = onSnapshot(exitQ, (snap) => {
          let data = snap.docs.map(d => d.data() as any);
          if (!isAd) {
            data = data.sort((a: any, b: any) => new Date(b.tanggalKeluar || 0).getTime() - new Date(a.tanggalKeluar || 0).getTime());
          }
          if (!firstExitLoad && !isAd) {
             snap.docChanges().forEach(change => {
               if (change.type === 'modified') {
                 const newData = change.doc.data();
                 if (newData.status === 'Disetujui' || newData.status === 'Ditolak') {
                   if (Notification.permission === 'granted') {
                     new Notification('Pembaruan Status Izin Keluar', { body: `Izin Keluar Anda telah ${newData.status}` });
                   } else {
                     alert(`Pemberitahuan: Izin Keluar Anda telah ${newData.status}`);
                   }
                 }
               }
             });
          }
          firstExitLoad = false;
          setExitPermissions(data);
          
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'exitPermissions'));

        // Sync Leave Requests
        const leaveQ = isAd 
          ? query(collection(db, 'leaveRequests'), limit(500))
          : query(collection(db, 'leaveRequests'), where('pejuangId', '==', uid), limit(50));
        let firstLeaveLoad = true;
        unsubLeave = onSnapshot(leaveQ, (snap) => {
          let data = snap.docs.map(d => d.data() as any);
          if (!isAd) {
            data = data.sort((a: any, b: any) => new Date(b.tanggalPengajuan || 0).getTime() - new Date(a.tanggalPengajuan || 0).getTime());
          }
          if (!firstLeaveLoad && !isAd) {
             snap.docChanges().forEach(change => {
               if (change.type === 'modified') {
                 const newData = change.doc.data();
                 if (newData.status === 'Disetujui' || newData.status === 'Ditolak') {
                   if (Notification.permission === 'granted') {
                     new Notification('Pembaruan Status Cuti', { body: `Pengajuan Cuti Anda telah ${newData.status}` });
                   } else {
                     alert(`Pemberitahuan: Pengajuan Cuti Anda telah ${newData.status}`);
                   }
                 }
               }
             });
          }
          firstLeaveLoad = false;
          setLeaveRequests(data);
          
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'leaveRequests'));

        // Sync Warning Letters
        const warnQ = isAd ? collection(db, 'warningLetters') : query(collection(db, 'warningLetters'), where('pejuangId', '==', uid));
        unsubWarn = onSnapshot(warnQ, (snap) => {
          const data = snap.docs.map(d => d.data() as any);
          setWarningLetters(data);
          
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'warningLetters'));

        // Sync Slip Ubar
        const slipQ = isAd ? collection(db, 'slipUbar') : query(collection(db, 'slipUbar'), where('pejuangId', '==', uid));
        unsubSlip = onSnapshot(slipQ, (snap) => {
          const data = snap.docs.map(d => d.data() as any);
          setSlipUbarList(data);
          
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'slipUbar'));

        // Sync Schedules
        unsubSchedules = onSnapshot(collection(db, 'schedules'), (snap) => {
          setSchedules(snap.docs.map(d => d.data() as WorkSchedule));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'schedules'));

        // Sync Location Settings
        unsubLoc = onSnapshot(doc(db, 'settings', 'location'), (docSnap) => {
          if (docSnap.exists()) {
            setLocationSettings(docSnap.data() as LocationSettings);
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/location'));


        // Sync Manhajiyyah Clauses
        let firstManhajLoad = true;
        unsubManhaj = onSnapshot(collection(db, 'manhajiyyahClauses'), (snap) => {
          if (!firstManhajLoad && !isAd) {
             snap.docChanges().forEach(change => {
               if (change.type === 'added' || change.type === 'modified') {
                 const newData = change.doc.data();
                 const msg = change.type === 'added' 
                   ? `Admin telah menambahkan Klausul Manhajiyyah baru: ${newData.title}`
                   : `Admin telah memperbarui Klausul Manhajiyyah: ${newData.title}`;
                 if (Notification.permission === 'granted') {
                   new Notification('Pembaruan Manhajiyyah', { body: msg });
                 } else {
                   alert(`Pemberitahuan: ${msg}`);
                 }
               }
             });
          }
          firstManhajLoad = false;
          setManhajiyyahClauses(snap.docs.map(d => d.data() as ManhajiyyahClause));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'manhajiyyahClauses'));
      } else {
        console.log('App: Firebase User is NULL in onAuthStateChanged.');
      }
    });

    return () => {
      unsubAuth();
      unsubUsers(); unsubAtt(); unsubExit(); unsubLeave(); unsubWarn(); unsubSlip();
      unsubSchedules(); unsubLoc(); unsubManhaj();
    };
  }, [currentUser]);

  const logAudit = async (action: string, details: string, user: UserAccount) => {
    try {
      const docRef = doc(collection(db, 'auditLogs'));
      await setDoc(docRef, {
        id: docRef.id,
        userId: user.id,
        userName: user.name,
        action,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'auditLogs');
    }
  };

  // Schedule Reminder Effect
  useEffect(() => {
    if (!currentUser || currentUser.role === 'Admin' || schedules.length === 0) return;
    
    // Request permission if needed
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkSchedule = () => {
      if (Notification.permission !== 'granted') return;
      
      const now = new Date();
      const currentDayIndex = now.getDay(); // 0 = Minggu
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
          const msg = `Waktu shift kerja Anda untuk ${sched.targetDivisi} akan dimulai 15 menit lagi pada pukul ${sched.jamMasuk}.`;
          new Notification('Pengingat Jadwal Masuk', { body: msg });
        }
      }
    };

    // Check once immediately, then every 1 minute
    checkSchedule();
    const interval = setInterval(checkSchedule, 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser, schedules]);

  const handleLoginSuccess = (user: UserAccount) => {
    console.log('App: handleLoginSuccess called. Setting currentUser to:', user.id);
    setCurrentUser(user);
        setActiveTab(user.role === 'Admin' ? 'dashboard' : 'absensi');
    logAudit('LOGIN', 'User logged in successfully', user);
    
    // Check onboarding
    if (user.role === 'Pejuang') {
      const hasSeen = localStorage.getItem(`onboarding_seen_${user.id}`);
      if (!hasSeen) {
        setShowOnboarding(true);
      }
    }
  };

  const handleLogout = () => {
    console.log('App: handleLogout called.');
    if (currentUser) {
      logAudit('LOGOUT', 'User logged out', currentUser);
    }
    signOut(auth)
      .then(() => console.log('App: Firebase signOut successful.'))
      .catch((err) => console.error('App: Firebase signOut error:', err))
      .finally(() => {
        console.log('App: Clearing currentUser state.');
        setCurrentUser(null);
              });
  };

  // State savers - Write to Firebase
  const handleSaveAccounts = async (accs: UserAccount[]) => {
    const addedOrUpdated = accs.filter(a => {
      const existing = accounts.find(ex => ex.id === a.id);
      return !existing || JSON.stringify(existing) !== JSON.stringify(a);
    });
    const deleted = accounts.filter(a => !accs.find(ac => ac.id === a.id));

    setAccounts(accs);
    try {
      for (const a of addedOrUpdated) {
        if (currentUser?.role === 'Admin' || currentUser?.id === a.id) {
          await setDoc(doc(db, 'users', a.id), a);
        }
      }
      if (currentUser?.role === 'Admin') {
        for (const a of deleted) {
           await deleteDoc(doc(db, 'users', a.id));
        }
        if (addedOrUpdated.length > 0 || deleted.length > 0) {
          logAudit('DATA_CHANGE', `Admin updated accounts: ${addedOrUpdated.map(u => u.name).join(', ')} | Deleted: ${deleted.map(u => u.name).join(', ')}`, currentUser);
        }
      }
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'users'); }
  };

  const handleSaveAttendance = async (atts: typeof attendance) => {
    const addedOrUpdated = atts.filter(a => {
      const existing = attendance.find(ex => ex.id === a.id);
      return !existing || JSON.stringify(existing) !== JSON.stringify(a);
    });
    setAttendance(atts);
        try {
      for (const a of addedOrUpdated) await setDoc(doc(db, 'attendance', a.id), a);
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'attendance'); }
  };

  const handleSaveExitPermissions = async (exs: typeof exitPermissions) => {
    const addedOrUpdated = exs.filter(a => {
      const existing = exitPermissions.find(ex => ex.id === a.id);
      return !existing || JSON.stringify(existing) !== JSON.stringify(a);
    });
    setExitPermissions(exs);
        try {
      for (const a of addedOrUpdated) await setDoc(doc(db, 'exitPermissions', a.id), a);
      if (currentUser?.role === 'Admin' && addedOrUpdated.length > 0) {
        logAudit('DATA_CHANGE', `Admin updated exit permissions for: ${addedOrUpdated.map(u => u.pejuangName).join(', ')}`, currentUser);
      }
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'exitPermissions'); }
  };

  const handleSaveLeaveRequests = async (lvs: typeof leaveRequests) => {
    const addedOrUpdated = lvs.filter(a => {
      const existing = leaveRequests.find(ex => ex.id === a.id);
      return !existing || JSON.stringify(existing) !== JSON.stringify(a);
    });
    setLeaveRequests(lvs);
        try {
      for (const a of addedOrUpdated) await setDoc(doc(db, 'leaveRequests', a.id), a);
      if (currentUser?.role === 'Admin' && addedOrUpdated.length > 0) {
        logAudit('DATA_CHANGE', `Admin updated leave requests for: ${addedOrUpdated.map(u => u.pejuangName).join(', ')}`, currentUser);
      }
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'leaveRequests'); }
  };

  const handleSaveWarningLetters = async (wls: typeof warningLetters) => {
    const addedOrUpdated = wls.filter(a => {
      const existing = warningLetters.find(ex => ex.id === a.id);
      return !existing || JSON.stringify(existing) !== JSON.stringify(a);
    });
    setWarningLetters(wls);
        if (currentUser?.role === 'Admin') {
      try {
        for (const a of addedOrUpdated) await setDoc(doc(db, 'warningLetters', a.id), a);
      } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'warningLetters'); }
    }
  };

  const handleSaveSlipUbar = async (slps: typeof slipUbarList) => {
    const addedOrUpdated = slps.filter(a => {
      const existing = slipUbarList.find(ex => ex.id === a.id);
      return !existing || JSON.stringify(existing) !== JSON.stringify(a);
    });
    setSlipUbarList(slps);
        if (currentUser?.role === 'Admin') {
      try {
        for (const a of addedOrUpdated) await setDoc(doc(db, 'slipUbar', a.id), a);
      } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'slipUbar'); }
    }
  };

  const handleSaveSchedules = async (schs: typeof schedules) => {
    setSchedules(schs);
    if (currentUser?.role === 'Admin') {
      try {
        const addedOrUpdated = schs.filter(a => {
          const existing = schedules.find(ex => ex.id === a.id);
          return !existing || JSON.stringify(existing) !== JSON.stringify(a);
        });
        const deleted = schedules.filter(a => !schs.find(ac => ac.id === a.id));

        for (const a of addedOrUpdated) await setDoc(doc(db, 'schedules', a.id), a);
        for (const a of deleted) {
          console.log(`[Audit] Deleting schedule document with ID ${a.id}`);
          await deleteDoc(doc(db, 'schedules', a.id));
        }
        if (deleted.length > 0 || addedOrUpdated.length > 0) {
          await logAudit('UPDATE_SCHEDULES', `Admin updated/deleted schedules. Added/Updated: ${addedOrUpdated.length}, Deleted: ${deleted.length}`, currentUser);
        }
      } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'schedules'); }
    }
  };

  const handleSaveLocationSettings = async (loc: typeof locationSettings) => {
    setLocationSettings(loc);
    if (currentUser?.role === 'Admin' && loc) {
      try {
        await setDoc(doc(db, 'settings', 'location'), loc);
      } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'settings/location'); }
    }
  };


  const handleSaveGeneralSettings = async (gen: Partial<GeneralSettings>) => {
    const updated = { ...generalSettings, ...gen };
    setGeneralSettings(updated);
    if (currentUser?.role === 'Admin') {
      try {
        await setDoc(doc(db, 'settings', 'general'), updated, { merge: true });
      } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'settings/general'); }
    }
  };

  const handleSaveManhajiyyahClauses = async (cls: typeof manhajiyyahClauses) => {
    setManhajiyyahClauses(cls);
    if (currentUser?.role === 'Admin') {
      try {
        const addedOrUpdated = cls.filter(a => {
          const existing = manhajiyyahClauses.find(ex => ex.id === a.id);
          return !existing || JSON.stringify(existing) !== JSON.stringify(a);
        });
        const deleted = manhajiyyahClauses.filter(a => !cls.find(ac => ac.id === a.id));

        for (const a of addedOrUpdated) await setDoc(doc(db, 'manhajiyyahClauses', a.id), a);
        for (const a of deleted) {
          console.log(`[Audit] Deleting manhajiyyah clause document with ID ${a.id}`);
          await deleteDoc(doc(db, 'manhajiyyahClauses', a.id));
        }
        if (deleted.length > 0 || addedOrUpdated.length > 0) {
          await logAudit('UPDATE_CLAUSES', `Admin updated/deleted clauses. Added/Updated: ${addedOrUpdated.length}, Deleted: ${deleted.length}`, currentUser);
        }
      } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'manhajiyyahClauses'); }
    }
  };

  if (!currentUser) {
    return (
      <LoginView
        appLogoUrl={generalSettings.appLogoUrl}
        accounts={accounts}
        manhajiyyahClauses={manhajiyyahClauses}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <>
      
      <IOSGlassLayout
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        leaveRequests={leaveRequests}
        exitPermissions={exitPermissions}
      >
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
                warningLetters={warningLetters}
                manhajiyyahClauses={manhajiyyahClauses}
                broadcastMessage={generalSettings.broadcastMessage}
                jenisCutiList={generalSettings.jenisCutiList}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === 'izin' && (
              <IzinKeluarView
                currentUser={currentUser}
                accounts={accounts}
                exitPermissions={exitPermissions}
                onSaveExitPermissions={handleSaveExitPermissions}
                suratIzinTemplateUrl={generalSettings.suratIzinTemplateUrl}
                kepalaPondokName={generalSettings.kepalaPondokName}
                appLogoUrl={generalSettings.appLogoUrl}
                izinKeluarApprovers={generalSettings.izinKeluarApprovers}
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
                suratCutiTemplateUrl={generalSettings.suratCutiTemplateUrl}
                kepalaPondokName={generalSettings.kepalaPondokName}
                appLogoUrl={generalSettings.appLogoUrl}
                cutiApprovers={generalSettings.cutiApprovers}
                jenisCutiList={generalSettings.jenisCutiList}
                onSaveAccounts={handleSaveAccounts}
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
                schedules={schedules}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView
                appLogoUrl={generalSettings.appLogoUrl}
                suratIzinTemplateUrl={generalSettings.suratIzinTemplateUrl}
                suratCutiTemplateUrl={generalSettings.suratCutiTemplateUrl}
                kepalaPondokName={generalSettings.kepalaPondokName}
                izinKeluarApprovers={generalSettings.izinKeluarApprovers}
                cutiApprovers={generalSettings.cutiApprovers}
                jenisCutiList={generalSettings.jenisCutiList}
                broadcastMessage={generalSettings.broadcastMessage}
                onSaveGeneralSettings={handleSaveGeneralSettings}
                currentUser={currentUser}
                accounts={accounts}
                locationSettings={locationSettings || INITIAL_LOCATION_SETTINGS}
                schedules={schedules}
                manhajiyyahClauses={manhajiyyahClauses}
                onSaveLocationSettings={handleSaveLocationSettings}
                onSaveSchedules={handleSaveSchedules}
                onSaveAccounts={handleSaveAccounts}
                onSaveManhajiyyahClauses={handleSaveManhajiyyahClauses}
                attendance={attendance}
                onDeleteAttendanceByMonth={async (month) => {
                  const attToKeep = attendance.filter(a => !a.date.startsWith(month));
                  const attToDelete = attendance.filter(a => a.date.startsWith(month));
                  
                  const exToKeep = exitPermissions.filter(e => !e.tanggalKeluar.startsWith(month));
                  const exToDelete = exitPermissions.filter(e => e.tanggalKeluar.startsWith(month));

                  // const lvToKeep = leaveRequests.filter(l => !l.tanggalMulai.startsWith(month));
                  const lvToDelete: any[] = []; // leaveRequests.filter(l => l.tanggalMulai.startsWith(month));
                  
                  // const slToKeep = slipUbarList.filter(s => !s.tanggalUpload.startsWith(month));
                  const slToDelete: any[] = []; // slipUbarList.filter(s => s.tanggalUpload.startsWith(month));

                  // Optimistic update
                  setAttendance(attToKeep);
                  setExitPermissions(exToKeep);
                  // setLeaveRequests(lvToKeep);
                  // setSlipUbarList(slToKeep);

                  // Delete from Firestore in batches (max 500 per batch)
                  try {
                    const allToDelete = [
                      ...attToDelete.map(a => ({ col: 'attendance', id: a.id })),
                      ...exToDelete.map(e => ({ col: 'exitPermissions', id: e.id })),
                      ...lvToDelete.map(l => ({ col: 'leaveRequests', id: l.id })),
                      ...slToDelete.map(s => ({ col: 'slipUbar', id: s.id }))
                    ];

                    const batches = [];
                    let currentBatch = writeBatch(db);
                    let count = 0;

                    for (const item of allToDelete) {
                      console.log(`[Audit] Queueing deletion for ${item.col} document with ID ${item.id}`);
                      // Check if doc exists before deleting if we were doing single deletes, but writeBatch.delete is safe even if doc doesn't exist
                      currentBatch.delete(doc(db, item.col, item.id));
                      count++;
                      if (count === 500) {
                        batches.push(currentBatch.commit());
                        currentBatch = writeBatch(db);
                        count = 0;
                      }
                    }
                    if (count > 0) {
                      batches.push(currentBatch.commit());
                    }

                    await Promise.all(batches);
                    
                    console.log(`[Audit] Batch deletion completed for month ${month}.`);
                    
                    // Add an audit log entry for this major action
                    await logAudit(
                      'DELETE_MONTHLY_RECORDS', 
                      `Admin deleted records for ${month}. Stats: ${attToDelete.length} attendance, ${exToDelete.length} exits, ${lvToDelete.length} leaves, ${slToDelete.length} slip ubar.`, 
                      currentUser
                    );
                  } catch (e) {
                    console.error('Error deleting batch:', e);
                    handleFirestoreError(e, OperationType.WRITE, 'batchDelete');
                  }
                }}
              />
            )}
          </motion.div>

        </AnimatePresence>
        
        {/* Footer Created By Abdu Salam */}
        <div className="w-full mt-auto pt-6 pb-4">
          <div className="max-w-md mx-auto text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 py-3 shadow-lg">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-center space-x-2">
              <span>Created By</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black tracking-normal text-xs sm:text-sm">Abdu Salam</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Al-Bahjah Cirebon 1</span>
            </p>
          </div>
        </div>
        
      </IOSGlassLayout>

    </>
  );
}
