// src/components/SystemProviders.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Icon } from './ui';

// =============================================================================
// ERROR BOUNDARY
// =============================================================================
export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('TShop Critical Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center text-white">
          <div className="bg-slate-900 p-8 rounded-2xl border border-red-500/50 max-w-md shadow-2xl">
            <Icon name="info" className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Bir Hata Oluştu</h2>
            <p className="text-slate-400 mb-6">
              Uygulama beklenmeyen bir hatayla karşılaştı. Verileriniz güvende.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors w-full"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// =============================================================================
// SESSION TIMEOUT & ACTIVITY TRACKER// =============================================================================
export function SessionManager({ children }: { children: React.ReactNode }) {
  const { currentUserId, setCurrentUser, addNotification, config } = useStore();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Aktivite takibi
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    
    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    
    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, []);

  // Timeout kontrolü
  useEffect(() => {
    if (!currentUserId) return;

    const checkTimeout = () => {
      const sessionTimeout = config?.sessionTimeout || 30 * 60 * 1000; // Default 30dk
      if (Date.now() - lastActivity > sessionTimeout) {
        setCurrentUser(null);
        addNotification("Oturum zaman aşımı. Güvenlik için çıkış yapıldı.", "warning");
      }
    };

    timeoutRef.current = setInterval(checkTimeout, 60000); // Her dakika kontrol et

    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [currentUserId, lastActivity, config, setCurrentUser, addNotification]);

  return <>{children}</>;
}

// =============================================================================
// LIVE ACTIVITY FEED
// =============================================================================
export function LiveActivityFeed() {
  const { users, products, orders } = useStore();  const [activity, setActivity] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const actions = [
      `${users[Math.floor(Math.random() * users.length)]?.username || 'Bir kullanıcı'} az önce giriş yaptı`,
      `${products[Math.floor(Math.random() * products.length)]?.name || 'Popüler ürün'} şu an inceleniyor`,
      `Yeni bir satıcı başvurusu alındı`,
      `${orders.length > 0 ? 'Son sipariş' : 'İlk sipariş'} başarıyla tamamlandı`,
      `Sistem performansı %99.9 uptime ile çalışıyor`,
      `VIP üyelik avantajları güncellendi`,
    ];

    const showActivity = () => {
      const msg = actions[Math.floor(Math.random() * actions.length)];
      setActivity(msg);
      setVisible(true);
      
      setTimeout(() => {
        setVisible(false);
      }, 4000);
    };

    // İlk gösterim 5sn sonra, sonra her 15sn'de bir
    const initialTimer = setTimeout(showActivity, 5000);
    const interval = setInterval(showActivity, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [users, products, orders]);

  if (!visible || !activity) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-4 z-40 animate-in slide-in-from-bottom fade-in duration-500 pointer-events-none">
      <div className="bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 max-w-xs md:max-w-sm">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
        <p className="text-xs md:text-sm text-slate-300 line-clamp-2">{activity}</p>
      </div>
    </div>
  );
}

// =============================================================================
// MAINTENANCE MODE SCREEN
// =============================================================================
export function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const { config, users, currentUserId } = useStore();  const user = users.find(u => u.id === currentUserId);
  
  // Admin ve üzeri roller bakım modundan etkilenmez
  const isAdmin = user && ['founder', 'super_admin', 'admin'].includes(user.role);
  
  if (config?.settings?.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl p-8 text-center max-w-md border border-slate-800 shadow-2xl">
          <Icon name="settings" className="w-16 h-16 text-orange-400 mx-auto mb-4 animate-spin-slow" />
          <h2 className="text-2xl font-bold text-white mb-2">🔧 Bakım Modu</h2>
          <p className="text-slate-400 mb-6">
            Site şu anda teknik bakımdadır. En kısa sürede geri döneceğiz.
          </p>
          <div className="text-xs text-slate-500">
            Tahmini dönüş süresi: 30 dakika
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
