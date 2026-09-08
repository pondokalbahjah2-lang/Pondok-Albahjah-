with open("src/App.tsx", "r") as f:
    content = f.read()

# Add notification logic for Cuti and Izin
notify_logic = """
    // Sync Cuti Notifications
    let firstCutiLoad = true;
    const unsubCutiNotif = onSnapshot(collection(db, 'cuti'), (snap) => {
      if (!firstCutiLoad && currentUser?.role === 'Admin') {
         snap.docChanges().forEach(change => {
           if (change.type === 'added') {
             const newData = change.doc.data();
             if (newData.status === 'Menunggu Persetujuan') {
               const msg = `Pengajuan Cuti Baru dari ${newData.pejuangName} (${newData.jenisCuti})`;
               if (Notification.permission === 'granted') {
                 new Notification('Al-Bahjah Sistem', { body: msg });
               } else {
                 alert(msg);
               }
             }
           }
         });
      }
      firstCutiLoad = false;
    });

    // Sync Izin Notifications
    let firstIzinLoad = true;
    const unsubIzinNotif = onSnapshot(collection(db, 'izinKeluar'), (snap) => {
      if (!firstIzinLoad && currentUser?.role === 'Admin') {
         snap.docChanges().forEach(change => {
           if (change.type === 'added') {
             const newData = change.doc.data();
             if (newData.status === 'Menunggu Persetujuan') {
               const msg = `Pengajuan Izin Keluar/Sakit Baru dari ${newData.pejuangName}`;
               if (Notification.permission === 'granted') {
                 new Notification('Al-Bahjah Sistem', { body: msg });
               } else {
                 alert(msg);
               }
             }
           }
         });
      }
      firstIzinLoad = false;
    });
"""

# Insert inside the auth effect
content = content.replace("    // Sync Manhajiyyah Clauses", notify_logic + "\n    // Sync Manhajiyyah Clauses")

# Add cleanup
content = content.replace("unsubManhaj();\n      unsubHolidays();", "unsubManhaj();\n      unsubHolidays();\n      unsubCutiNotif();\n      unsubIzinNotif();")

with open("src/App.tsx", "w") as f:
    f.write(content)
