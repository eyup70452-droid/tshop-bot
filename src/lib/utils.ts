import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch(e) {}
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const sanitize = (str: string, maxLen = 1000) => {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLen)
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, ''');
};

export const formatNumber = (n: number | undefined | null) => {
  if (n === undefined || n === null || isNaN(n)) return '0';
  return new Intl.NumberFormat('tr-TR').format(Math.floor(n));
};

export const formatDate = (d: number | string) => {
  try { return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return ''; }
};

export const timeAgo = (date: number | string) => {
  try {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'az önce';
    if (seconds < 3600) return `${Math.floor(seconds/60)} dk önce`;
    if (seconds < 86400) return `${Math.floor(seconds/3600)} sa önce`;
    if (seconds < 604800) return `${Math.floor(seconds/86400)} gün önce`;
    return formatDate(date);
  } catch { return ''; }
};

export const createRateLimiter = (key: string, maxActions: number, windowMs: number) => {
  return {
    canAct: () => {
      try {
        const raw = localStorage.getItem(`rl_${key}`);
        if (!raw) return true;
        const data = JSON.parse(raw);
        const now = Date.now();
        const recentActions = data.filter((t: number) => now - t < windowMs);
        return recentActions.length < maxActions;
      } catch { return true; }
    },
    record: () => {
      try {
        const raw = localStorage.getItem(`rl_${key}`);
        const data = raw ? JSON.parse(raw) : [];
        const now = Date.now();
        const recentActions = [...data.filter((t: number) => now - t < windowMs), now];
        localStorage.setItem(`rl_${key}`, JSON.stringify(recentActions));
      } catch {}
    }
  };
};
