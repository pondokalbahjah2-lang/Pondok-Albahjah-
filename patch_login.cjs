const fs = require('fs');
let content = fs.readFileSync('src/components/LoginView.tsx', 'utf8');

const oldLogic = `        const cred = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
          matchedUser = userDoc.data() as UserAccount;
        } else {
          // Re-create user document if it's missing but auth succeeded
          matchedUser = {
            id: cred.user.uid,
            username: email.split('@')[0],
            password,
            name: email.split('@')[0],
            role: email.includes('admin') || email.includes('abdusalam') || email.includes('salamabdu') ? 'Admin' : 'Pejuang',
            subDivisi: 'Manajemen Kepondokan',
            amanah: 'Staff',
            email,
            phone: '081234567890',
          };
          if (email.includes('abdusalam') || email.includes('salamabdu')) {
             matchedUser.name = 'Abdu Salam';
             matchedUser.username = 'Abdu Salam';
             matchedUser.amanah = 'Sekretaris Pondok Pesantren Al-Bahjah Cabang Cirebon 1';
          }
          await setDoc(doc(db, 'users', cred.user.uid), matchedUser);
        }`;

const newLogic = `        const cred = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
          matchedUser = userDoc.data() as UserAccount;
        } else {
          throw new Error('Akun Anda belum terdaftar secara lengkap di sistem database. Silakan hubungi Admin.');
        }`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync('src/components/LoginView.tsx', content);
  console.log("LoginView updated successfully.");
} else {
  console.log("oldLogic not found in LoginView.tsx");
}
