import fs from 'fs';

// Need to update App.tsx to manage 'generalSettings' for the Logo
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

const stateCode = `  const [generalSettings, setGeneralSettings] = useState<{ appLogoUrl?: string }>({});`;
appContent = appContent.replace(/  const \[locationSettings, setLocationSettings\] = useState<LocationSettings \| null>\(null\);/, stateCode + '\n  const [locationSettings, setLocationSettings] = useState<LocationSettings | null>(null);');

const loadCode = `
        // Sync General Settings
        const unsubGeneral = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
          if (docSnap.exists()) {
            setGeneralSettings(docSnap.data() as { appLogoUrl?: string });
          }
        }, (err) => console.log('Settings read err'));
`;
appContent = appContent.replace(/        \/\/ Sync Manhajiyyah Clauses/, loadCode + '\n        // Sync Manhajiyyah Clauses');

const saveCode = `
  const handleSaveGeneralSettings = async (gen: { appLogoUrl?: string }) => {
    setGeneralSettings(gen);
    if (currentUser?.role === 'Admin') {
      try {
        await setDoc(doc(db, 'settings', 'general'), gen, { merge: true });
      } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'settings/general'); }
    }
  };
`;
appContent = appContent.replace(/  const handleSaveManhajiyyahClauses/, saveCode + '\n  const handleSaveManhajiyyahClauses');

// Add generalSettings and handleSaveGeneralSettings to Sidebar and SettingsView props
appContent = appContent.replace(/<Sidebar[\s\S]*?activeTab=\{activeTab\}/, `<Sidebar\n              appLogoUrl={generalSettings.appLogoUrl}\n              currentUser={currentUser}\n              activeTab={activeTab}`);

appContent = appContent.replace(/<SettingsView[\s\S]*?onSaveLocationSettings=\{handleSaveLocationSettings\}/, `<SettingsView
                appLogoUrl={generalSettings.appLogoUrl}
                onSaveGeneralSettings={handleSaveGeneralSettings}
                currentUser={currentUser}
                accounts={accounts}
                locationSettings={locationSettings || INITIAL_LOCATION_SETTINGS}
                schedules={schedules}
                manhajiyyahClauses={manhajiyyahClauses}
                onSaveLocationSettings={handleSaveLocationSettings}`);

fs.writeFileSync('src/App.tsx', appContent);
console.log("Patched App.tsx for Logo");
