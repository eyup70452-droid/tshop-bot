// src/lib/security.ts

/**
 * Browser Fingerprint Generator
 * Çoklu hesap koruması için kullanılır
 */
export const getFingerprint = async (): Promise<string> => {
  if (typeof window === 'undefined') return 'ssr_fingerprint';
  
  const data: string[] = [];
  
  // Browser bilgileri
  data.push(navigator.userAgent);
  data.push(navigator.language);
  data.push(String(screen.colorDepth));
  data.push(`${screen.width}x${screen.height}`);
  data.push(String(new Date().getTimezoneOffset()));
  data.push(String(navigator.hardwareConcurrency || 'unknown'));
  data.push(navigator.platform || 'unknown');
  
  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('TShop Fingerprint', 2, 2);
      data.push(canvas.toDataURL().slice(-50));
    }
  } catch(e) { /* Canvas blocked */ }
  
  // Hash
  const str = data.join('|');
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
};

/**
 * Password Hashing (SHA-256 + Salt)
 */
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * CSRF Token Generator
 */
export const generateCSRFToken = (): string => {
  try {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  } catch(e) {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }
};

/**
 * Rate Limiter (Client-side)
 */
export const createRateLimiter = (key: string, maxActions: number, windowMs: number) => {
  return {
    canAct: (): boolean => {
      if (typeof window === 'undefined') return true;
      try {
        const raw = localStorage.getItem(`rl_${key}`);
        if (!raw) return true;
        const data: number[] = JSON.parse(raw);
        const now = Date.now();
        const recentActions = data.filter(t => now - t < windowMs);
        return recentActions.length < maxActions;
      } catch { return true; }
    },
    record: (): void => {
      if (typeof window === 'undefined') return;
      try {
        const raw = localStorage.getItem(`rl_${key}`);
        const data: number[] = raw ? JSON.parse(raw) : [];
        const now = Date.now();
        const recentActions = [...data.filter(t => now - t < windowMs), now];
        localStorage.setItem(`rl_${key}`, JSON.stringify(recentActions));
      } catch {}
    }
  };
};
