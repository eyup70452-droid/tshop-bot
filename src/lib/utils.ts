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
    return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

export const formatTime = (d: number | string): string => {
  try {
    return new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export const timeAgo = (date: number | string): string => {
  try {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'az once';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' dk once';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' sa once';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' gun once';
    return formatDate(date);
  } catch {
    return '';
  }
};

export const sanitize = (str: string, maxLen: number = 1000): string => {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLen);
};
