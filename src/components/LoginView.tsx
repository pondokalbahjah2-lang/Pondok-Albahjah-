import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  User,
  BookOpen,
  Calendar,
  ChevronRight,
  Eye,
  EyeOff,
  LogIn,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { UserAccount, ManhajiyyahClause } from '../types';
import { getHijriDate, formatMasehiDate, getDailyClauseIndex } from '../utils/hijriCalendar';
import { auth, db } from '../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AL_BAHJAH_LOGO_BASE64 } from '../data/logoBase64';

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
  // Logo State with fallback to official high-res vector
  const [logoUrl, setLogoUrl] = useState<string>(appLogoUrl || AL_BAHJAH_LOGO_BASE64);

  useEffect(() => {
    if (appLogoUrl && appLogoUrl.trim()) {
      setLogoUrl(appLogoUrl);
    } else {
      setLogoUrl(AL_BAHJAH_LOGO_BASE64);
    }
  }, [appLogoUrl]);

  // Intro Splash State
  const [splashExited, setSplashExited] = useState(false);
  const [splashRemoved, setSplashRemoved] = useState(false);
  const [appShown, setAppShown] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [btnState, setBtnState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [showClauseModal, setShowClauseModal] = useState(false);

  // Real-time Clock and Date
  const [now, setNow] = useState(new Date());
  const lastSecRef = useRef(-1);
  const [secTicking, setSecTicking] = useState(false);

  // Typewriter text for Pasal Hari ini
  const [typedQuote, setTypedQuote] = useState('');
  const quoteIndexRef = useRef(0);

  // Wipe transition
  const [wipeActive, setWipeActive] = useState(false);
  const [wipeOrigin, setWipeOrigin] = useState({ x: 0, y: 0 });
  const [appLeaving, setAppLeaving] = useState(false);

  // Refs
  const btnRef = useRef<HTMLButtonElement>(null);
  const titleText = "Portal Pejuang Al-Bahjah";

  // Daily Clause Calculation
  const dailyClauseIndex = getDailyClauseIndex(manhajiyyahClauses.length, now);
  const clauseToday = manhajiyyahClauses[dailyClauseIndex] || manhajiyyahClauses[0];
  const quoteTarget = clauseToday?.content || 'Membiasakan diri melawan hawa nafsu, baik dalam urusan yang haram atau yang mubah.';

  // Check prefers-reduced-motion safely
  const prefersReduced =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? Boolean(window.matchMedia('(prefers-reduced-motion: reduce)')?.matches)
      : false;

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNow(d);
      if (d.getSeconds() !== lastSecRef.current) {
        lastSecRef.current = d.getSeconds();
        setSecTicking(true);
        setTimeout(() => setSecTicking(false), 350);
      }
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const hijriDate = getHijriDate(now);
  const masehiDateStr = formatMasehiDate(now);

  // Splash Timeline & Skip Handlers
  const exitSplash = () => {
    if (splashExited) return;
    setSplashExited(true);
    setTimeout(() => {
      setAppShown(true);
    }, 150);
    setTimeout(() => {
      setSplashRemoved(true);
    }, 800);
  };

  useEffect(() => {
    if (prefersReduced) {
      setSplashExited(true);
      setSplashRemoved(true);
      setAppShown(true);
      setTypedQuote(`"${quoteTarget}"`);
      return;
    }

    const autoTimer = setTimeout(() => {
      exitSplash();
    }, 2200);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        clearTimeout(autoTimer);
        exitSplash();
      }
    };
    const handleTouch = () => {
      clearTimeout(autoTimer);
      exitSplash();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      clearTimeout(autoTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, [prefersReduced, quoteTarget]);

  // Typewriter Quote Effect
  useEffect(() => {
    if (!appShown) return;
    if (prefersReduced) {
      setTypedQuote(`"${quoteTarget}"`);
      return;
    }

    setTypedQuote('');
    quoteIndexRef.current = 0;
    const fullText = `"${quoteTarget}"`;

    const typeTimer = setTimeout(() => {
      const interval = setInterval(() => {
        if (quoteIndexRef.current < fullText.length) {
          quoteIndexRef.current++;
          setTypedQuote(fullText.slice(0, quoteIndexRef.current));
        } else {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    }, 600);

    return () => clearTimeout(typeTimer);
  }, [appShown, quoteTarget, prefersReduced]);

  // Spotlight mouse tracking on glass containers
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  // Replay Intro Function
  const handleReplayIntro = () => {
    setAppShown(false);
    setSplashRemoved(false);
    setSplashExited(false);
    setTypedQuote('');
    setErrorMsg('');
    setBtnState('idle');
    setWipeActive(false);
    setAppLeaving(false);
  };

  // Main Login Function Synchronized with Firebase
  const executeLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (btnState === 'loading' || btnState === 'done') return;

    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Silakan masukkan nama pengguna atau email akun Anda.');
      return;
    }

    if (!password) {
      setErrorMsg('Silakan masukkan kata sandi Anda.');
      return;
    }

    // Trigger button animation
    setBtnState('loading');

    // Create ripple effect
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const ripple = document.createElement('span');
      const d = Math.max(r.width, r.height);
      ripple.className = 'ripple';
      ripple.style.width = `${d}px`;
      ripple.style.height = `${d}px`;
      ripple.style.left = `${r.width / 2 - d / 2}px`;
      ripple.style.top = `${r.height / 2 - d / 2}px`;
      btnRef.current.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }

    const trimmedInput = username.trim().toLowerCase();
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
          matchedUser = { id: userDoc.id, ...userDoc.data() } as UserAccount;
        } else {
          // Auto-setup initial admin if matched
          if (
            email.includes('admin') ||
            email.includes('abdusalam') ||
            email.includes('salamabdu') ||
            email.includes('pondokalbahjah2')
          ) {
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

        // Auto-create for admin if first time
        if (
          (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') &&
          (email.includes('admin') ||
            email.includes('abdusalam') ||
            email.includes('salamabdu') ||
            email.includes('pondokalbahjah2'))
        ) {
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
            throw new Error('Gagal membuat akun admin: ' + createErr.message);
          }
        } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          throw new Error('Username/Email atau Kata Sandi salah. Silakan periksa kembali.');
        } else if (err.code === 'auth/user-not-found') {
          throw new Error('Akun tidak ditemukan. Silakan hubungi Admin Divisi Kepondokan.');
        } else if (err.code === 'auth/network-request-failed') {
          throw new Error('Gagal terhubung ke jaringan internet. Pastikan koneksi Anda stabil.');
        } else {
          throw new Error(err.message || 'Gagal masuk ke sistem.');
        }
      }

      if (matchedUser) {
        // Animation: Change to Checkmark (.done)
        setBtnState('done');
        await new Promise((r) => setTimeout(r, 800));

        // Circular screen wave expansion
        if (btnRef.current) {
          const b = btnRef.current.getBoundingClientRect();
          setWipeOrigin({ x: b.left + b.width / 2, y: b.top + b.height / 2 });
        }
        setWipeActive(true);
        setAppLeaving(true);

        await new Promise((r) => setTimeout(r, 900));
        onLoginSuccess(matchedUser);
      } else {
        setBtnState('idle');
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Terjadi kesalahan sistem.');
      setBtnState('idle');
    }
  };

  // Helper to cleanly format clause label without repeats
  const formatClauseHeader = (clause?: ManhajiyyahClause) => {
    if (!clause) return 'Pasal Manhajiyyah';
    let num = (clause.pasalNumber || '').trim();
    let title = (clause.title || '').trim();

    // If title already starts with "Pasal", return title cleanly
    if (title.toLowerCase().startsWith('pasal')) {
      return title;
    }
    // Strip leading "pasal" from number if any
    num = num.replace(/^pasal\s*/i, '').trim();
    if (num && title && num !== title) {
      return `Pasal ${num}: ${title}`;
    }
    return title || (num ? `Pasal ${num}` : 'Pasal Manhajiyyah');
  };

  const shouldShowCategoryBadge = (clause?: ManhajiyyahClause, headerText?: string) => {
    if (!clause?.category) return false;
    const cat = clause.category.trim().toLowerCase();
    const h = (headerText || '').toLowerCase();
    const t = (clause.title || '').toLowerCase();
    return cat !== h && cat !== t && !h.includes(cat);
  };

  // Pad helper for clock
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="relative min-h-screen w-full select-none bg-[#010806] text-white font-sans antialiased overflow-x-hidden">
      {/* ---------- Background & Floating Blobs (No Lightning) ---------- */}
      <div className="portal-bg" aria-hidden="true">
        <div className="portal-blob b1" />
        <div className="portal-blob b2" />
      </div>

      {/* ---------- Splash Screen Intro ---------- */}
      {!splashRemoved && (
        <div
          id="portal-splash"
          className={splashExited ? 'exit' : ''}
          onClick={exitSplash}
          role="button"
          tabIndex={0}
          aria-label="Klik untuk melewati intro"
        >
          <div className="s-grid" />
          <div className="s-cross h" />
          <div className="s-cross v" />
          <div className="s-center">
            <div className="s-logo">
              <div className="s-glow" />
              <svg className="s-outline" viewBox="0 0 160 160" aria-hidden="true">
                <path
                  className="ol"
                  pathLength="1"
                  d="M48 4 H112 A44 44 0 0 1 156 48 V112 A44 44 0 0 1 112 156 H48 A44 44 0 0 1 4 112 V48 A44 44 0 0 1 48 4 Z"
                />
                <rect className="node" style={{ '--i': 0 } as React.CSSProperties} x="44.5" y="0.5" width="7" height="7" />
                <rect className="node" style={{ '--i': 1 } as React.CSSProperties} x="108.5" y="0.5" width="7" height="7" />
                <rect className="node" style={{ '--i': 2 } as React.CSSProperties} x="152.5" y="44.5" width="7" height="7" />
                <rect className="node" style={{ '--i': 3 } as React.CSSProperties} x="152.5" y="108.5" width="7" height="7" />
                <rect className="node" style={{ '--i': 4 } as React.CSSProperties} x="108.5" y="152.5" width="7" height="7" />
                <rect className="node" style={{ '--i': 5 } as React.CSSProperties} x="44.5" y="152.5" width="7" height="7" />
                <rect className="node" style={{ '--i': 6 } as React.CSSProperties} x="0.5" y="108.5" width="7" height="7" />
                <rect className="node" style={{ '--i': 7 } as React.CSSProperties} x="0.5" y="44.5" width="7" height="7" />
              </svg>
              <div className="pen" />
              <div className="s-fill">
                <img
                  src={logoUrl}
                  alt="Logo Al-Bahjah"
                  onError={() => setLogoUrl(AL_BAHJAH_LOGO_BASE64)}
                  className="w-full h-full object-contain p-2"
                />
              </div>
            </div>

            <h1 className="s-title" aria-label={titleText}>
              {titleText.split('').map((ch, i) => (
                <span key={i} className="ch" style={{ '--i': i } as React.CSSProperties} aria-hidden="true">
                  {ch}
                </span>
              ))}
            </h1>
            <p className="s-tag">Manajemen Terpadu Divisi Kepondokan</p>
            <div className="s-line" />
          </div>
          <div className="s-skip">KLIK ATAU TEKAN SPASI UNTUK MELEWATI</div>
        </div>
      )}

      {/* ---------- Main Portal Login View ---------- */}
      <main id="portal-app" className={`${appShown ? 'show' : ''} ${appLeaving ? 'leaving' : ''}`}>
        <div className="app-inner">
          {/* Header Section: Logo, Title & Subtitle */}
          <div className="flex flex-col items-center text-center rv" style={{ '--d': 0 } as React.CSSProperties}>
            <div className="logo-box">
              <img
                src={logoUrl}
                alt="Logo Pondok Pesantren Al-Bahjah"
                onError={() => setLogoUrl(AL_BAHJAH_LOGO_BASE64)}
              />
            </div>

            <h1 className="portal-title">
              Portal Pejuang Al-Bahjah
            </h1>
            <p className="portal-subtitle">
              Manajemen Terpadu Divisi Kepondokan Yayasan Al-Bahjah Cabang Cirebon 1
            </p>
          </div>

          {/* Compact Islamic Datebar & Digital Clock */}
          <div
            className="datebar portal-glass rv"
            style={{ '--d': 0.14 } as React.CSSProperties}
            onPointerMove={handlePointerMove}
          >
            <div className="hijri">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{hijriDate.formatted}</span>
            </div>

            <div className="clock">
              <span>{pad(now.getHours())}</span>
              <span className="sep">:</span>
              <span>{pad(now.getMinutes())}</span>
              <span className="sep">:</span>
              <span className={`sec ${secTicking ? 'tick' : ''}`}>{pad(now.getSeconds())}</span>
            </div>

            <div className="greg">{masehiDateStr}</div>
          </div>

          {/* Pasal Hari Ini Card with Animated Conic Border - Above Login Card */}
          <section
            className="pasal portal-glass rv"
            style={{ '--d': 0.24 } as React.CSSProperties}
            onPointerMove={handlePointerMove}
          >
            <div className="flex-1 min-w-0">
              <div className="pasal-h">
                <BookOpen className="w-3.5 h-3.5" />
                <span>PASAL HARI INI</span>
              </div>

              <div className="pills">
                <span className="pill g truncate max-w-full">
                  {formatClauseHeader(clauseToday)}
                </span>
                {shouldShowCategoryBadge(clauseToday, formatClauseHeader(clauseToday)) && (
                  <span className="pill a">{clauseToday?.category}</span>
                )}
              </div>

              <p className="quote">
                <span>{typedQuote}</span>
                <span className="caret" />
              </p>
            </div>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowClauseModal(true)}
            >
              <span>Daftar Semua Pasal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </section>

          {/* Main Login Form Card - Clean, directly visible & professional */}
          <div
            className="login-card portal-glass rv"
            style={{ '--d': 0.34 } as React.CSSProperties}
            onPointerMove={handlePointerMove}
          >
            <div className="mb-4">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Masuk ke Sistem</span>
              </h2>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Masukkan username atau email dan kata sandi Anda
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-2">
                <X className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={executeLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Nama Pengguna (Username / Email)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username atau email"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-white/[0.08] border border-white/15 focus:border-emerald-400 focus:bg-white/[0.12] focus:ring-2 focus:ring-emerald-400/30 text-white placeholder-slate-400 text-xs sm:text-sm outline-none transition-all"
                    disabled={btnState !== 'idle'}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl bg-white/[0.08] border border-white/15 focus:border-emerald-400 focus:bg-white/[0.12] focus:ring-2 focus:ring-emerald-400/30 text-white placeholder-slate-400 text-xs sm:text-sm outline-none transition-all"
                    disabled={btnState !== 'idle'}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                ref={btnRef}
                type="submit"
                className={`login-portal-btn w-full ${btnState === 'loading' ? 'loading' : ''} ${
                  btnState === 'done' ? 'done' : ''
                }`}
                disabled={btnState !== 'idle'}
                aria-label="Log In ke Sistem"
              >
                <span className="label">
                  <LogIn className="i w-[18px] h-[18px]" />
                  <span>Log In ke Sistem</span>
                </span>

                <span className="spin" />

                <svg
                  className="ok"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* ---------- Wave Wipe Transition Out ---------- */}
      <div
        id="portal-wipe"
        className={wipeActive ? 'go' : ''}
        style={{
          left: `${wipeOrigin.x}px`,
          top: `${wipeOrigin.y}px`,
        }}
      />

      {/* ---------- Replay Intro Button ---------- */}
      <button
        type="button"
        className="portal-replay"
        onClick={handleReplayIntro}
        title="Putar ulang animasi intro"
      >
        <span className="flex items-center gap-1.5">
          <RotateCcw className="w-3 h-3" />
          <span>Putar ulang intro</span>
        </span>
      </button>

      {/* ---------- Modal Daftar Semua Pasal ---------- */}
      {showClauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">
                  Manhajiah Pejuang Al-Bahjah ({manhajiyyahClauses.length} Pasal)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowClauseModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1.5 custom-scrollbar">
              {manhajiyyahClauses.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-400 text-xs">
                      {formatClauseHeader(c)}
                    </span>
                    {c.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800">
                        {c.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowClauseModal(false)}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
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
