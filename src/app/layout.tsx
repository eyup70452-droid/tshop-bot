// src/app/layout.tsx
import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'TShop Ultimate - Dijital Market',
  description: 'Güvenli dijital ürün marketi. Oyun kodları, abonelikler, hediye kartları.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
