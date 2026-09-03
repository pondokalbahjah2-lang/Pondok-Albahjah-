import React, { useState, useEffect } from 'react';
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

      <div className="w-full max-w-4xl relative z-10 my-auto py-6">
        {/* Top Header & Real-time Dates Banner */}
        <div className="mb-6 text-center space-y-2">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden p-2">
              {appLogoUrl ? (
                <img src={appLogoUrl} alt="Logo Pondok Al-Bahjah" className="w-full h-full object-contain drop-shadow-md" />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-inner">
                  B
                </div>
              )}
            </div>
          </div>
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs font-semibold text-emerald-300 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Kepondokan Al-Bahjah Cirebon 1</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            Portal Pejuang Al-Bahjah
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 font-medium max-w-md mx-auto">
            Manajemen Terpadu Divisi Kepondokan Yayasan Al-Bahjah Cabang Cirebon 1
          </p>

          {/* Realtime Hijri & Masehi Widget Banner */}
          <div className="mt-4 max-w-lg mx-auto p-3.5 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/15 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-300 font-bold">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{hijriDate.formatted}</span>
            </div>
            <div className="text-slate-300 font-medium">{masehiDateStr}</div>
          </div>
        </div>

        {/* Main Grid: Login Card + Pasal Manhajiyyah Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* iOS Liquid Glass Login Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Masuk Sistem</h2>
                  <p className="text-xs text-slate-300">Masukkan kredensial akun pejuang Anda</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 overflow-hidden">
                  {appLogoUrl ? (
                    <img src={appLogoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
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
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/15 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 text-white placeholder-slate-400 text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white/10 border border-white/15 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 text-white placeholder-slate-400 text-xs outline-none transition-all"
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

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span>{isLoading ? 'Memproses...' : 'Masuk Ke Sistem'}</span>
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                      Atau
                    </span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  {accounts.some(a => a.webAuthnCredentialId) && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleBiometricLogin}
                      className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <Fingerprint className="w-5 h-5 text-emerald-400" />
                      <span>Masuk dengan Biometrik</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Daily Rotating Manhajiyyah Clause Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900/40 via-amber-900/30 to-slate-900/40 backdrop-blur-3xl border border-emerald-500/30 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-400 uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Pasal Manhajiyyah Hari Ini (1 Pasal 1 Hari)</span>
              </div>

              {clauseToday && (
                <div className="space-y-3 mt-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                    Pasal {clauseToday.pasalNumber}: {clauseToday.title}
                  </div>
                  <h3 className="text-base font-bold text-white">{clauseToday.category}</h3>
                  <p className="text-xs text-slate-200 leading-relaxed italic line-clamp-6">
                    "{clauseToday.content}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowClauseModal(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-emerald-300 font-bold text-xs transition-colors flex items-center justify-between"
              >
                <span>Baca Selengkapnya / Cari Pasal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
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
