// src/components/ui.tsx
"use client";

import React, { useState, useCallback, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// =============================================================================
// ICONS (Lucide yerine hafif SVG sistemi)
// =============================================================================
export const Icon = memo(({ name, className = "w-5 h-5", filled = false }: { name: string; className?: string; filled?: boolean }) => {
  const paths: Record<string, React.ReactNode> = {
    logo: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    home: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    store: <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
    wallet: <path d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
    tasks: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
    trophy: <path d="M12 15a3 3 0 100-6 3 3 0 000 6z M12 15v4m-4 0h8M5 3h14a2 2 0 012 2v2a5 5 0 01-5 5H8a5 5 0 01-5-5V5a2 2 0 012-2z" />,
    heart: <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
    user: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    box: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    bell: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    x: <path d="M6 18L18 6M6 6l12 12" />,
    check: <path d="M5 13l4 4L19 7" />,
    plus: <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />,
    minus: <path d="M20 12H4" />,
    trash: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    shield: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    trending: <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    key: <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />,
    mail: <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    lock: <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    edit: <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    gift: <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    chat: <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
    copy: <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />,
    zap: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    send: <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
    help: <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    eye: <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
    eyeOff: <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />,
    activity: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    tag: <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />,
    share: <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />,
    info: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    filter: <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />,
    chevDown: <path d="M19 9l-7 7-7-7" />,    qr: <path d="M12 4v16m8-8H4" />,
    megaphone: <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />,
    loader: <><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="none"/></>,
    star: <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    users: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    compare: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    bag: <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
    download: <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
    dice: <path d="M7 7h.01M7 17h.01M17 7h.01M17 17h.01M12 12h.01" />,
    coin: <path d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2M12 8c2.21 0 4-.895 4-2s-1.79-2-4-2-4 .895-4 2 1.79 2 4 2zM12 8v8" />,
    target: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    logout: <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    settings: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
    crown: <path d="M5 16L3 8l5.5 4L12 4l3.5 8L21 8l-2 8H5z" />,
    boost: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    upload: <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />,
    camera: <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />,
    bank: <path d="M3 21v-2m0 0V8l9-5 9 5v11m-18 0h18m-9-9v7m-5-7v7m5-7v7m5-7v7m-10 0h10" />,
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || paths.info}
    </svg>
  );
});

// =============================================================================
// RIPPLE BUTTON
// =============================================================================
export const RippleButton = memo(({ 
  children, onClick, variant = "primary", className = "", disabled = false, 
  isLoading = false, size = "md", type = "button", ...props 
}: any) => {
  const [ripples, setRipples] = useState<any[]>([]);
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled || isLoading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples(prev => [...prev, { x, y, id: Math.random() }]);
    setTimeout(() => setRipples(prev => prev.slice(1)), 600);
    onClick?.(e);
  }, [disabled, isLoading, onClick]);

  const variants: any = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50",    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
    success: "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white",
    purple: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white",
    outline: "border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10",
    warning: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white",
    gold: "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg shadow-yellow-500/25",
    telegram: "bg-gradient-to-r from-[#24A1DE] to-[#1e8bc2] hover:from-[#1e8bc2] hover:to-[#186f9b] text-white",
  };
  
  const sizes: any = { 
    xs: "px-2 py-1 text-xs", 
    sm: "px-3 py-1.5 text-xs", 
    md: "px-4 py-2 text-sm", 
    lg: "px-6 py-3 text-base", 
    xl: "px-8 py-4 text-lg" 
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        "relative overflow-hidden rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2", 
        variants[variant], 
        sizes[size], 
        className
      )}
      {...props}
    >
      {isLoading ? <Icon name="loader" className="w-5 h-5 animate-spin" /> : children}
      {ripples.map(ripple => (
        <motion.span 
          key={ripple.id} 
          className="absolute bg-white/30 rounded-full pointer-events-none"
          initial={{ width: 0, height: 0, x: ripple.x, y: ripple.y, opacity: 0.5 }}
          animate={{ width: 200, height: 200, x: ripple.x - 100, y: ripple.y - 100, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      ))}
    </button>
  );
});

// =============================================================================
// BADGE
// =============================================================================
export const Badge = memo(({ children, variant = "default", className = "" }: any) => {
  const variants: any = {
    default: "bg-slate-700 text-slate-200 border-slate-600",    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    danger: "bg-red-500/20 text-red-400 border-red-500/30",
    warning: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
});

// =============================================================================
// TOAST NOTIFICATION
// =============================================================================
export const Toast = memo(({ message, type = "success", onClose }: any) => {
  useEffect(() => { 
    const timer = setTimeout(() => { if (onClose) onClose(); }, 3500); 
    return () => clearTimeout(timer); 
  }, [onClose]);

  const colors: any = { success: "bg-emerald-500", error: "bg-red-500", info: "bg-blue-500", warning: "bg-orange-500" };
  const icons: any = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, x: "-50%" }} 
      animate={{ opacity: 1, y: 0, x: "-50%" }} 
      exit={{ opacity: 0, y: 50, x: "-50%" }}
      className={cn("fixed bottom-24 md:bottom-8 left-1/2 transform -translate-x-1/2 z-[110] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-white", colors[type])}
    >
      <span className="text-lg font-bold">{icons[type]}</span>
      <span className="font-medium text-sm">{message}</span>
    </motion.div>
  );
});

// =============================================================================
// MODAL
// =============================================================================
export const Modal = memo(({ isOpen, onClose, children, title, size = "md" }: any) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {       window.removeEventListener('keydown', handleEsc); 
      document.body.style.overflow = ''; 
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses: any = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className={cn("bg-slate-900 border border-slate-700 rounded-2xl w-full my-8 relative shadow-2xl overflow-hidden", sizeClasses[size])}
          >
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                  <Icon name="x" />
                </button>
              </div>
            )}
            <div className="p-4 md:p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// =============================================================================
// CONFIRM DIALOG
// =============================================================================
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Onayla", cancelText = "İptal", variant = "primary" }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-slate-300 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <RippleButton variant="ghost" onClick={onClose}>{cancelText}</RippleButton>
      <RippleButton variant={variant} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</RippleButton>
    </div>
  </Modal>
);
// =============================================================================
// COUNTDOWN TIMER
// =============================================================================
export const CountdownTimer = memo(({ targetDate, onExpire, compact = false }: any) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const update = () => {
      const diff = targetDate - Date.now();
      if (diff <= 0) { 
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); 
        if (onExpire) onExpire(); 
        return; 
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (compact) {
    return <span className="font-mono text-orange-400 font-bold">{timeLeft.hours}sa {timeLeft.minutes}dk {timeLeft.seconds}sn</span>;
  }

  const TimeBox = ({ value, label }: any) => (
    <div className="bg-slate-800 rounded-lg p-2 text-center min-w-[50px]">
      <div className="text-2xl font-bold text-white font-mono">{String(value).padStart(2, '0')}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );

  return (
    <div className="flex gap-2 items-center">
      {timeLeft.days > 0 && <TimeBox value={timeLeft.days} label="Gün" />}
      <TimeBox value={timeLeft.hours} label="Saat" />
      <TimeBox value={timeLeft.minutes} label="Dk" />
      <TimeBox value={timeLeft.seconds} label="Sn" />
    </div>
  );
});

// =============================================================================
// CONFETTI// =============================================================================
export const Confetti = memo(({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
            left: `${Math.random() * 100}%`,
            top: `-10px`
          }}
          initial={{ y: -10, opacity: 1, rotate: 0 }}
          animate={{ y: window.innerHeight + 50, opacity: 0, rotate: Math.random() * 360 }}
          transition={{ duration: Math.random() * 2 + 1.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
});
