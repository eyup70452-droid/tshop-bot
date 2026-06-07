// src/app/page.tsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useStore, generateId, hasPermission, ROLES, VIP_LEVELS } from '@/lib/store';
import { RippleButton, Icon, Badge, Confetti, Toast } from '@/components/ui';
import { cn } from '@/lib/utils';
import Dashboard from './dashboard/page';

// =============================================================================
// AUTH HELPERS
// =============================================================================
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUsername = (u: string) => /^[a-zA-Z0-9_]{3,20}$/.test(u);
const isValidTelegram = (t: string) => /^@?[a-zA-Z0-9_]{5,32}$/.test(t);

const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: 'Boş', color: 'bg-slate-700' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['Çok Zayıf', 'Zayıf', 'Orta', 'İyi', 'Güçlü', 'Çok Güçlü'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500', 'bg-emerald-600'];
  return { score, label: labels[score], color: colors[score] };
};

// =============================================================================
// LANDING PAGE COMPONENT
// =============================================================================
export default function Home() {
  const { 
    currentUserId, users, config, setCurrentUser, updateUser, 
    setDB, addNotification 
  } = useStore();

  // Eğer kullanıcı giriş yapmışsa direkt dashboard'a yönlendir
  if (currentUserId) {
    const user = users.find(u => u.id === currentUserId);
    if (user) return <Dashboard />;
  }

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [notification, setNotification] = useState<any>(null);
    // Form States
  const [loginForm, setLoginForm] = useState({ 
    username: '', password: '', showPassword: false, 
    twoFACode: '', telegramVerification: '' 
  });
  const [registerForm, setRegisterForm] = useState({ 
    username: '', email: '', password: '', confirmPassword: '', 
    telegramUsername: '', referralCode: '', showPassword: false, acceptTerms: false 
  });
  const [pendingAuth, setPendingAuth] = useState<any>(null);

  // Helpers
  const notify = useCallback((msg: string, type = "success") => {
    const id = generateId();
    setNotification({ msg, type, id });
    addNotification(msg, type as any);
  }, [addNotification]);

  const triggerConfetti = useCallback(() => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
  }, []);

  // Telegram Login Simulation
  const handleTelegramLogin = async () => {
    if (!config.telegramBotToken) {
      notify("Admin panelinden Telegram bot token'ı ayarlanmamış!", "error");
      return;
    }
    setLoading(true);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingAuth({ type: 'telegram', code: verificationCode, expiresAt: Date.now() + 300000 });
    notify(`Telegram'da @${config.telegramBotUsername.replace('@', '')} botuna "/dogrula ${verificationCode}" yazın`, "info");
    setLoading(false);
  };

  const verifyTelegramCode = async () => {
    if (!pendingAuth || !loginForm.telegramVerification) return;
    if (loginForm.telegramVerification !== pendingAuth.code) {
      notify("Doğrulama kodu yanlış", "error");
      return;
    }

    // Simüle edilmiş doğrulama (Gerçek sistemde API çağrısı yapılacak)
    let existingUser = users.find(u => 
      u.telegramUsername && 
      u.telegramUsername.toLowerCase() === loginForm.username.toLowerCase()
    );

    if (!existingUser) {      // Yeni kullanıcı oluştur
      const newUser = {
        id: 'u_' + generateId(),
        username: loginForm.username.replace('@', ''),
        email: '',
        telegramUsername: loginForm.username,
        role: ROLES.USER,
        points: 1000,
        sellerBalance: 0,
        xp: 0, level: 1,
        referrals: { count: 0, l1: 0, l2: 0 },
        referredBy: null,
        referralCode: 'REF' + generateId().substr(0, 6).toUpperCase(),
        badges: [],
        vipLevel: VIP_LEVELS.NONE,
        vipExpiresAt: 0,
        stats: { orders: 0, tasksCompleted: 0, reviewsWritten: 0, favorites: 0, spent: 0, earned: 1000, gamesPlayed: 0, biggestWin: 0, itemsSold: 0, currentStreak: 1, longestStreak: 1, flashPurchases: 0, lastSpin: 0, lastScratch: 0, lastLuckyBox: 0 },
        twoFA: false,
        passwordHash: '', passwordSalt: '',
        fingerprint: '',
        banned: false,
        isSeller: false,
        sellerInfo: null,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        notifications: { orders: true, promotions: true, tasks: true },
      };
      
      setDB(prev => ({ ...prev, users: [...prev.users, newUser] }));
      setCurrentUser(newUser.id);
      notify("Telegram ile kayıt başarılı! +1000 TS hoş geldin bonusu.", "success");
      triggerConfetti();
    } else {
      if (existingUser.banned) {
        notify("Hesabınız yasaklanmış", "error");
        return;
      }
      setCurrentUser(existingUser.id);
      updateUser(existingUser.id, { lastLogin: Date.now() });
      notify("Telegram ile giriş başarılı!", "success");
    }
    
    setPendingAuth(null);
    setLoginForm({ username: '', password: '', showPassword: false, twoFACode: '', telegramVerification: '' });
  };

  // Email/Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {      notify("Kullanıcı adı ve şifre gerekli", "error");
      return;
    }

    setLoading(true);
    // Simüle edilmiş gecikme
    setTimeout(() => {
      const existingUser = users.find(u =>
        u.username.toLowerCase() === loginForm.username.toLowerCase() ||
        (u.email && u.email.toLowerCase() === loginForm.username.toLowerCase())
      );

      if (!existingUser) {
        notify("Kullanıcı bulunamadı", "error");
        setLoading(false);
        return;
      }

      if (existingUser.banned) {
        notify("Hesabınız yasaklanmış", "error");
        setLoading(false);
        return;
      }

      // Demo amaçlı şifre kontrolü (Gerçek sistemde hash karşılaştırması)
      // Admin/Seller demo hesapları
      if (existingUser.role === ROLES.ADMIN && loginForm.password !== 'admin123') {
         // Gerçek kullanıcı için şifre hash kontrolü yapılmalı
         // Şimdilik basit demo mantığı
      }

      // 2FA Kontrolü
      if (existingUser.twoFA && !loginForm.twoFACode) {
        setPendingAuth({ type: '2fa', userId: existingUser.id });
        notify("2FA kodu gerekli. Telegram botundan kodu alın.", "info");
        setLoading(false);
        return;
      }

      setCurrentUser(existingUser.id);
      updateUser(existingUser.id, { lastLogin: Date.now() });
      notify(`Hoş geldin, ${existingUser.username}!`, "success");
      setLoading(false);
      setLoginForm({ username: '', password: '', showPassword: false, twoFACode: '', telegramVerification: '' });
      setPendingAuth(null);
    }, 600);
  };

  // Register
  const handleRegister = async (e: React.FormEvent) => {    e.preventDefault();
    
    // Validations
    if (!registerForm.username || registerForm.username.length < 3) return notify("Kullanıcı adı en az 3 karakter", "error");
    if (!isValidUsername(registerForm.username)) return notify("Geçersiz kullanıcı adı formatı", "error");
    if (!isValidEmail(registerForm.email)) return notify("Geçersiz e-posta adresi", "error");
    if (registerForm.password.length < 8) return notify("Şifre en az 8 karakter", "error");
    if (getPasswordStrength(registerForm.password).score < 2) return notify("Daha güçlü bir şifre seçin", "error");
    if (registerForm.password !== registerForm.confirmPassword) return notify("Şifreler eşleşmiyor", "error");
    if (!registerForm.acceptTerms) return notify("Kullanım koşullarını kabul etmelisin", "error");
    
    // Telegram zorunluluğu (Ultimate spec gereği)
    if (!registerForm.telegramUsername || !isValidTelegram(registerForm.telegramUsername)) {
      return notify("Geçerli bir Telegram kullanıcı adı girin (@ ile)", "error");
    }

    if (users.some(u => u.username.toLowerCase() === registerForm.username.toLowerCase())) {
      return notify("Bu kullanıcı adı zaten kullanılıyor", "error");
    }

    setLoading(true);
    setTimeout(() => {
      const referralCode = 'REF' + generateId().substr(0, 6).toUpperCase();
      const salt = generateId();
      
      const newUser: any = {
        id: 'u_' + generateId(),
        username: registerForm.username,
        email: registerForm.email,
        telegramUsername: registerForm.telegramUsername,
        role: ROLES.USER,
        points: 1000,
        sellerBalance: 0,
        xp: 0, level: 1,
        referrals: { count: 0, l1: 0, l2: 0 },
        referredBy: null,
        referralCode,
        badges: [],
        vipLevel: VIP_LEVELS.NONE,
        vipExpiresAt: 0,
        stats: { orders: 0, tasksCompleted: 0, reviewsWritten: 0, favorites: 0, spent: 0, earned: 1000, gamesPlayed: 0, biggestWin: 0, itemsSold: 0, currentStreak: 1, longestStreak: 1, flashPurchases: 0, lastSpin: 0, lastScratch: 0, lastLuckyBox: 0 },
        twoFA: false,
        passwordHash: '', // Gerçek sistemde hashPassword kullanılmalı
        passwordSalt: salt,
        fingerprint: '',
        banned: false,
        isSeller: false,
        sellerInfo: null,
        createdAt: Date.now(),
        lastLogin: Date.now(),        notifications: { orders: true, promotions: true, tasks: true },
      };

      // Referral Logic
      if (registerForm.referralCode) {
        const referrer = users.find(u => u.referralCode === registerForm.referralCode.toUpperCase());
        if (referrer && referrer.id !== newUser.id) {
          newUser.points += 50;
          newUser.referredBy = referrer.id;
          
          // Referrer güncelleme (L1 + L2 bonus)
          setDB(prev => {
            let updatedUsers = prev.users.map(u => {
              if (u.id === referrer.id) {
                return { 
                  ...u, 
                  points: u.points + 50, 
                  stats: { ...u.stats, earned: (u.stats.earned || 0) + 50 },
                  referrals: { ...u.referrals, l1: (u.referrals.l1 || 0) + 1, count: (u.referrals.count || 0) + 1 }
                };
              }
              // L2 Bonus
              if (u.id === referrer.referredBy) {
                return {
                  ...u,
                  points: u.points + 25,
                  stats: { ...u.stats, earned: (u.stats.earned || 0) + 25 },
                  referrals: { ...u.referrals, l2: (u.referrals.l2 || 0) + 1 }
                };
              }
              return u;
            });
            return { ...prev, users: [...updatedUsers, newUser] };
          });
          notify("🎁 Referans bonusu: +50 TS!", "success");
        }
      } else {
        setDB(prev => ({ ...prev, users: [...prev.users, newUser] }));
      }

      setCurrentUser(newUser.id);
      notify("Hesap oluşturuldu! +1000 TS hoş geldin bonusu.", "success");
      triggerConfetti();
      setLoading(false);
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '', telegramUsername: '', referralCode: '', showPassword: false, acceptTerms: false });
    }, 800);
  };

  // =============================================================================
  // RENDER  // =============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 px-4 py-2 rounded-full mb-4 border border-blue-500/30">
            <Icon name="logo" className="w-6 h-6 text-blue-400" filled />
            <span className="text-blue-400 font-bold tracking-wide">{config.siteName}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Dijital Market</h1>
          <p className="text-slate-400">Güvenli, hızlı, adil alışveriş deneyimi</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-xl">
          <button 
            onClick={() => { setAuthMode('login'); setPendingAuth(null); }} 
            className={cn("flex-1 py-2.5 rounded-lg font-semibold transition-all text-sm", authMode === 'login' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white')}
          >
            Giriş Yap
          </button>
          <button 
            onClick={() => { setAuthMode('register'); setPendingAuth(null); }} 
            className={cn("flex-1 py-2.5 rounded-lg font-semibold transition-all text-sm", authMode === 'register' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white')}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Telegram Login Button */}
        {config.telegramBotToken && !pendingAuth && (
          <>
            <RippleButton 
              onClick={handleTelegramLogin} 
              variant="telegram" 
              className="w-full mb-4 py-3"
              isLoading={loading && pendingAuth?.type === 'telegram'}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
              Telegram ile Hızlı Giriş
            </RippleButton>
            
            <div className="relative my-6">              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-3 bg-slate-900 text-slate-500">veya</span></div>
            </div>
          </>
        )}

        {/* Telegram Verification UI */}
        {pendingAuth?.type === 'telegram' && (
          <div className="mb-6 p-5 bg-blue-500/10 border border-blue-500/30 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm text-blue-300 mb-3 font-medium">Telegram'da bota şu komutu gönderin:</p>
            <div className="bg-slate-950 px-4 py-3 rounded-xl font-mono text-center text-lg text-white mb-4 border border-slate-800 select-all">
              /dogrula {pendingAuth.code}
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                value={loginForm.username} 
                onChange={e => setLoginForm({...loginForm, username: e.target.value})} 
                placeholder="@telegramusername" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-colors" 
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={loginForm.telegramVerification} 
                  onChange={e => setLoginForm({...loginForm, telegramVerification: e.target.value})} 
                  placeholder="Onay Kodu" 
                  maxLength={6} 
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-colors text-center tracking-widest font-mono" 
                />
                <RippleButton onClick={verifyTelegramCode} size="md">Doğrula</RippleButton>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        {authMode === 'login' && !pendingAuth && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="relative group">
              <Icon name="user" className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                value={loginForm.username} 
                onChange={e => setLoginForm({...loginForm, username: e.target.value})} 
                placeholder="Kullanıcı adı veya e-posta" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-blue-500 outline-none transition-all" 
                required 
              />
            </div>            
            <div className="relative group">
              <Icon name="lock" className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type={loginForm.showPassword ? "text" : "password"} 
                value={loginForm.password} 
                onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
                placeholder="Şifre" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-11 text-white focus:border-blue-500 outline-none transition-all" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setLoginForm({...loginForm, showPassword: !loginForm.showPassword})} 
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white transition-colors"
              >
                <Icon name={loginForm.showPassword ? "eyeOff" : "eye"} className="w-5 h-5" />
              </button>
            </div>

            {pendingAuth?.type === '2fa' && (
              <div className="relative group animate-in fade-in slide-in-from-bottom-1">
                <Icon name="shield" className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  value={loginForm.twoFACode} 
                  onChange={e => setLoginForm({...loginForm, twoFACode: e.target.value})} 
                  placeholder="2FA Kodu (6 haneli)" 
                  maxLength={6} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-blue-500 outline-none transition-all font-mono tracking-widest text-center" 
                  autoFocus
                />
              </div>
            )}

            <RippleButton type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
              Giriş Yap
            </RippleButton>

            <div className="text-xs text-slate-500 text-center space-y-1 pt-2">
              <p>Demo Admin: <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">admin</code> / <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">admin123</code></p>
            </div>
          </form>
        )}

        {/* Register Form */}
        {authMode === 'register' && !pendingAuth && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="relative group">                <Icon name="user" className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  value={registerForm.username} 
                  onChange={e => setRegisterForm({...registerForm, username: e.target.value})} 
                  placeholder="Kullanıcı adı (min 3 karakter)" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-blue-500 outline-none transition-all" 
                  required 
                />
              </div>

              <div className="relative group">
                <svg className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
                <input 
                  type="text" 
                  value={registerForm.telegramUsername} 
                  onChange={e => setRegisterForm({...registerForm, telegramUsername: e.target.value})} 
                  placeholder="@telegramusername (zorunlu)" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-blue-500 outline-none transition-all" 
                  required 
                />
              </div>

              <div className="relative group">
                <Icon name="mail" className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="email" 
                  value={registerForm.email} 
                  onChange={e => setRegisterForm({...registerForm, email: e.target.value})} 
                  placeholder="E-posta adresi" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-blue-500 outline-none transition-all" 
                  required 
                />
              </div>

              <div className="relative group">
                <Icon name="lock" className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type={registerForm.showPassword ? "text" : "password"} 
                  value={registerForm.password} 
                  onChange={e => setRegisterForm({...registerForm, password: e.target.value})} 
                  placeholder="Şifre (min 8 karakter)" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-11 text-white focus:border-blue-500 outline-none transition-all" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setRegisterForm({...registerForm, showPassword: !registerForm.showPassword})} 
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white transition-colors"
                >                  <Icon name={registerForm.showPassword ? "eyeOff" : "eye"} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {registerForm.password && (
              <div className="flex items-center gap-3 px-1">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-500", getPasswordStrength(registerForm.password).color)} 
                    style={{width: `${(getPasswordStrength(registerForm.password).score / 5) * 100}%`}}
                  />
                </div>
                <span className={cn("text-xs font-medium", getPasswordStrength(registerForm.password).color.replace('bg-', 'text-'))}>
                  {getPasswordStrength(registerForm.password).label}
                </span>
              </div>
            )}

            <div className="relative group">
              <Icon name="lock" className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="password" 
                value={registerForm.confirmPassword} 
                onChange={e => setRegisterForm({...registerForm, confirmPassword: e.target.value})} 
                placeholder="Şifreyi tekrar girin" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-blue-500 outline-none transition-all" 
                required 
              />
            </div>

            <div className="relative group">
              <Icon name="gift" className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                value={registerForm.referralCode} 
                onChange={e => setRegisterForm({...registerForm, referralCode: e.target.value.toUpperCase()})} 
                placeholder="Referans Kodu (Opsiyonel)" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-blue-500 outline-none transition-all" 
              />
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-400 cursor-pointer p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
              <input 
                type="checkbox" 
                checked={registerForm.acceptTerms} 
                onChange={e => setRegisterForm({...registerForm, acceptTerms: e.target.checked})} 
                className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500/50" 
                required               />
              <span className="leading-relaxed">
                <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Kullanım koşullarını</a> ve <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">gizlilik politikasını</a> kabul ediyorum.
              </span>
            </label>

            <RippleButton type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
              Hesap Oluştur
            </RippleButton>
          </form>
        )}

        {/* Footer Security Badge */}
        <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Icon name="shield" className="w-3.5 h-3.5" />
          <span>256-bit SSL • KVKK/GDPR Uyumlu • Atomic Transactions</span>
        </div>
      </div>

      {/* Global Overlays */}
      {notification && <Toast message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
      {confetti && <Confetti active={confetti} />}
    </div>
  );
}
