// src/app/layout.tsx
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ErrorBoundary, SessionManager, LiveActivityFeed, MaintenanceCheck } from '@/components/SystemProviders';

export const metadata: Metadata = {
  title: 'TShop Ultimate - Dijital Market',
  description: 'Güvenli dijital ürün marketi. Oyun kodları, abonelikler, hediye kartları ve daha fazlası.',
  keywords: ['dijital market', 'oyun kodu', 'steam', 'netflix', 'spotify', 'vip'],
  authors: [{ name: 'TShop Team' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-200 antialiased selection:bg-blue-500/30">
        <ErrorBoundary>
          <SessionManager>
            <MaintenanceCheck>
              {children}
              <LiveActivityFeed />
            </MaintenanceCheck>
          </SessionManager>
        </ErrorBoundary>
      </body>
    </html>
  );
}
