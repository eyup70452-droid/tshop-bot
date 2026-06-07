// src/components/SystemProviders.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Icon } from './ui';

// Error Boundary
export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center text-white">
          <div className="bg-slate-900 p-8 rounded-2xl border border-red-500/50 max-w-md">
            <Icon name="info" className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Bir Hata Oluştu</h2>
            <p className="text-slate-400 mb-4">Uygulama beklenmeyen bir hatayla karşılaştı.</p>
            <button onClick={() => window.location.reload()} className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 w-full">Sayfayı Yenile</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Session Manager
export function SessionManager({ children }: { children: React.ReactNode }) {
  const { currentUserId, setCurrentUser, addNotification, config } = useStore();
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const update = () => setLastActivity(Date.now());
    window.addEventListener('click', update);
    window.addEventListener('keydown', update);
    window.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('click', update);
      window.removeEventListener('keydown', update);
      window.removeEventListener('scroll', update);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeout = config?.sessionTimeout || 30 * 60 * 1000;
      if (Date.now() - lastActivity > timeout && currentUserId) {
        setCurrentUser(null);
        addNotification("Oturum zaman aşımı. Güvenlik için çıkış yapıldı.", "warning");
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [lastActivity, currentUserId, config, setCurrentUser, addNotification]);

  return <>{children}</>;
}
