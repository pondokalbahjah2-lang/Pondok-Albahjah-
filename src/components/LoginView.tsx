import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  User,
  ShieldCheck,
  Calendar,
  BookOpen,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Fingerprint,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserAccount, ManhajiyyahClause } from '../types';
import { getHijriDate, formatMasehiDate, getDailyClauseIndex } from '../utils/hijriCalendar';
import { auth, db, handleFirestoreError, OperationType } from '../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface LoginViewProps {
  appLogoUrl?: string;
  accounts: UserAccount[];
  manhajiyyahClauses: ManhajiyyahClause[];
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  appLogoUrl,
  accounts,
  manhajiyyahClauses,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [runawayX, setRunawayX] = useState(0);
  const [runawayY, setRunawayY] = useState(0);

  const handleButtonHover = () => {
    if (!username || !password) {
      setRunawayX(Math.random() * 200 - 100);
      setRunawayY(Math.random() * 80 - 40);
    } else {
      setRunawayX(0);
      setRunawayY(0);
    }
  };
  const [showClauseModal, setShowClauseModal] = useState(false);
    const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hijriDate = getHijriDate(now);
  const masehiDateStr = formatMasehiDate(now);

  const dailyClauseIndex = getDailyClauseIndex(manhajiyyahClauses.length, now);
  const clauseToday = manhajiyyahClauses[dailyClauseIndex] || manhajiyyahClauses[0];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const trimmedInput = username?.trim().toLowerCase() || '';
    let email = trimmedInput;
    if (!trimmedInput.includes('@')) {
      email = `${trimmedInput.replace(/[^a-z0-9]/g, '')}@albahjah.or.id`;
    }

    try {
      let matchedUser: UserAccount | null = null;
      
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
          matchedUser = userDoc.data() as UserAccount;
        } else {
          // Hanya izinkan auto-create jika email adalah email admin, untuk setup awal
          if (email.includes('admin') || email.includes('abdusalam') || email.includes('salamabdu') || email.includes('pondokalbahjah2')) {
            matchedUser = {
              id: cred.user.uid,
              username: email.split('@')[0],
              password,
              name: email.split('@')[0],
              role: 'Admin',
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
          } else {
            throw new Error('Akun Anda belum terdaftar secara lengkap di sistem database. Silakan hubungi Admin.');
          }
        }
      } catch (err: any) {
        console.warn('Firebase Auth Failed:', err.code, err.message);
        
        // Auto-create for admin if not found
        if ((err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') && (email.includes('admin') || email.includes('abdusalam') || email.includes('salamabdu') || email.includes('pondokalbahjah2'))) {
           try {
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
                            await setDoc(doc(db, 'users', newCred.user.uid), matchedUser);
           } catch (createErr: any) {
              console.error('Auto-create failed:', createErr);
              throw new Error('Gagal membuat akun admin secara otomatis: ' + createErr.message);
           }
        } else
        if (err.code === 'auth/operation-not-allowed') {
          throw new Error('Firebase Authentication belum diaktifkan. Silakan aktifkan penyedia Login "Email/Password" di Firebase Console.');
        } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
          throw new Error('Username/Email atau Kata Sandi salah, atau akun belum didaftarkan oleh admin.');
        } else if (err.code === 'auth/network-request-failed') {
          throw new Error('Gagal terhubung ke server (Network Error). Pastikan koneksi internet Anda stabil. Jika menggunakan AdBlocker atau mode incognito, coba matikan sementara karena dapat memblokir proses masuk.');
        } else {
          throw new Error(`Gagal masuk: ${err.message}`);
        }
      }

      if (matchedUser) {
        onLoginSuccess(matchedUser);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      if (!window.PublicKeyCredential) {
        throw new Error('Perangkat atau browser Anda tidak mendukung autentikasi biometrik.');
      }
      
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      const getCredentialArgs: CredentialRequestOptions = {
        publicKey: {
          challenge: challenge,
          timeout: 60000,
          userVerification: 'preferred'
        }
      };

      const credential = await navigator.credentials.get(getCredentialArgs) as PublicKeyCredential;
      
      if (credential && accounts.length > 0) {
        // Attempt to find user by their registered WebAuthn credential ID
        const matchedUser = accounts.find(a => a.webAuthnCredentialId === credential.id);
          
        if (matchedUser) {
          if (matchedUser.email && matchedUser.password) {
            await signInWithEmailAndPassword(auth, matchedUser.email, matchedUser.password);
          }
          onLoginSuccess(matchedUser);
        } else {
          throw new Error('Data biometrik tidak dikenali di sistem. Silakan login manual dan daftarkan sidik jari/Face ID Anda di menu Pengaturan Sistem.');
        }
      } else if (!accounts.length) {
        throw new Error('Tidak ada data akun di database.');
      }
    } catch (error: any) {
      console.error(error);
      if (error.name === 'NotAllowedError') {
        setErrorMsg('Permintaan biometrik dibatalkan atau tidak diizinkan. Jika Anda membuka dari iframe, silakan buka aplikasi di tab baru (Safari/Chrome).');
      } else {
        setErrorMsg(error.message || 'Gagal memverifikasi biometrik.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-amber-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
      {/* Liquid Ambient Background Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-4xl relative z-10 my-auto py-2 sm:py-4 px-3 sm:px-4 mx-auto flex flex-col items-center">
        {/* Top Header & Real-time Dates Banner */}
        <div className="mb-3 text-center space-y-1 w-full">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden p-1.5">
              {appLogoUrl ? (
                <img src={appLogoUrl} alt="Logo Pondok Al-Bahjah" className="w-full h-full object-contain drop-shadow-md" />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-inner">
                  B
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-md mt-1">
            Portal Pejuang Al-Bahjah
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 font-medium max-w-xl mx-auto mt-0.5">
            Manajemen Terpadu Divisi Kepondokan Yayasan Al-Bahjah Cabang Cirebon 1
          </p>

          {/* Realtime Hijri & Masehi Widget Banner */}
          <div className="mt-3 max-w-2xl mx-auto py-2 px-4 rounded-xl bg-white/10 backdrop-blur-2xl border border-white/15 shadow-lg flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4 text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-300 font-bold text-[11px] sm:text-xs text-center">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{hijriDate.formatted}</span>
            </div>
            <div className="text-base sm:text-lg font-black tracking-widest text-emerald-300 drop-shadow-md tabular-nums px-3 py-1 rounded-lg bg-black/20 border border-emerald-500/20">
              {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}:{now.getSeconds().toString().padStart(2, '0')}
            </div>
            <div className="text-slate-200 font-medium text-[11px] sm:text-xs text-center">{masehiDateStr}</div>
          </div>
        </div>

        {/* Main Section: Wide Landscape Manhajiyyah + Login Card */}
        <div className="w-full flex flex-col items-center gap-3 sm:gap-4">
          {/* Daily Rotating Manhajiyyah Clause Card - Sleek Wide Landscape */}
          <div className="w-full max-w-2xl p-3 sm:py-3 sm:px-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-amber-950/80 backdrop-blur-2xl border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-left">
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Pasal Hari Ini</span>
                </div>
                {clauseToday && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-400/30 truncate">
                    Pasal {clauseToday.pasalNumber}: {clauseToday.title}
                  </span>
                )}
                {clauseToday?.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-400/30">
                    {clauseToday.category}
                  </span>
                )}
              </div>

              {clauseToday && (
                <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed italic line-clamp-2">
                  "{clauseToday.content}"
                </p>
              )}
            </div>

            <div className="w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowClauseModal(true)}
                className="w-full sm:w-auto py-1.5 px-3 rounded-xl bg-white/10 hover:bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-[10px] sm:text-xs transition-colors flex items-center justify-center sm:justify-start space-x-1.5 whitespace-nowrap shadow-sm"
              >
                <span>Daftar Semua Pasal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* iOS Liquid Glass Login Card */}
          <div className="w-full max-w-md p-4 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Masuk Sistem</h2>
                  <p className="text-[11px] sm:text-xs text-slate-300">Masukkan kredensial akun pejuang Anda</p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Nama Pengguna (Username)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan Username atau Email"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-white/10 border border-white/15 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 text-white placeholder-slate-400 text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-200">
                      Kata Sandi (Password)
                    </label>
                    <button type="button" onClick={() => alert("Silakan hubungi admin untuk melakukan validasi lupa password dan mengatur ulang kata sandi Anda.")} className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">Lupa Password?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-2xl bg-white/10 border border-white/15 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 text-white placeholder-slate-400 text-xs outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none p-1"
                      title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-1.5 space-y-3">
                  <div className="relative w-full" onMouseEnter={handleButtonHover}>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      animate={{ x: runawayX, y: runawayY }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-full py-2.5 sm:py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-colors duration-200 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed z-10"
                    >
                      <span>{isLoading ? 'Memproses...' : 'Masuk Ke Sistem'}</span>
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Modal View All Clauses */}
      {showClauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">
                  Manhajiah Pejuang Al-Bahjah ({manhajiyyahClauses.length} Pasal)
                </h3>
              </div>
              <button
                onClick={() => setShowClauseModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2">
              {manhajiyyahClauses.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-400 text-xs">
                      Pasal {c.pasalNumber}: {c.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800">
                      {c.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowClauseModal(false)}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
