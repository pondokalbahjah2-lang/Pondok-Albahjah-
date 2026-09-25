import fs from 'fs';

let content = fs.readFileSync('src/components/LoginView.tsx', 'utf-8');

const regex = /catch \(err: any\) \{[\s\S]*?console\.warn\('Firebase Auth Failed:', err\.code, err\.message\);/;

const replaceStr = `catch (err: any) {
        console.warn('Firebase Auth Failed:', err.code, err.message);
        
        // Auto-create for admin if not found
        if ((err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') && (email.includes('admin') || email.includes('abdusalam') || email.includes('salamabdu') || email.includes('pondokalbahjah2'))) {
           try {
              const { createUserWithEmailAndPassword } = require('firebase/auth');
              const newCred = await createUserWithEmailAndPassword(auth, email, password);
              
              matchedUser = {
                id: newCred.user.uid,
                username: email.split('@')[0],
                password,
                name: email.split('@')[0],
                role: 'Admin',
                subDivisi: 'Manajemen Kepondokan',
                amanah: 'Staff',
                email,
                phone: '081234567890',
              };
              
              if (email.includes('abdusalam') || email.includes('salamabdu') || email.includes('pondokalbahjah2')) {
                 matchedUser.name = 'Abdu Salam';
                 matchedUser.username = 'Abdu Salam';
                 matchedUser.amanah = 'Sekretaris Pondok Pesantren Al-Bahjah Cabang Cirebon 1';
              }
              const { doc, setDoc } = require('firebase/firestore');
              await setDoc(doc(db, 'users', newCred.user.uid), matchedUser);
           } catch (createErr: any) {
              console.error('Auto-create failed:', createErr);
              throw new Error('Gagal membuat akun admin secara otomatis: ' + createErr.message);
           }
        } else`;

content = content.replace(regex, replaceStr);

fs.writeFileSync('src/components/LoginView.tsx', content, 'utf-8');
console.log('Fixed login admin auto-create');
