// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (n: number | undefined | null): string => {
  if (n === undefined || n === null || isNaN(n)) return '0';
  return new Intl.NumberFormat('tr-TR').format(Math.floor(n));
};

export const formatDate = (d: number | string): string => {
  try {
    return new Date(d).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

export const formatTime = (d: number | string): string => {
  try {
    return new Date(d).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};

export const timeAgo = (date: number | string): string => {
  try {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dk önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} sa önce`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
    return formatDate(date);
  } catch {
    return '';
  }
};

/**
 * Güvenli Sanitize Fonksiyonu
 * GitHub web editöründe karakter bozulmasını önlemek için
 * .replace() zinciri yerine for döngüsü kullanılmıştır.
 */
export const sanitize = (str: string, maxLen: number = 1000): string => {
  if (typeof str !== 'string') return '';
  const truncated = str.slice(0, maxLen);
  let result = '';
  for (let i = 0; i < truncated.length; i++) {
    const ch = truncated[i];
    const code = truncated.charCodeAt(i);
    // Kontrol karakterlerini temizle
    if (code < 32 || code === 127) continue;
    if (ch === '&') result += '&' + 'amp;';
    else if (ch === '<') result += '&' + 'lt;';
    else if (ch === '>') result += '&' + 'gt;';
    else if (ch === '"') result += '&' + 'quot;';
    else if (ch === "'") result += '&' + '#x27;';
    else result += ch;
  }
  return result;
};
