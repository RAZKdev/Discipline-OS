import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PWARegistration } from '@/components/PWARegistration';

export const metadata: Metadata = {
  title: 'Discipline-OS — Sistem Konsistensi Harian yang Tenang & Terstruktur',
  description:
    'Sistem konsistensi personal beretika: Fondasi → Kesehatan → Disiplin → Gerbang Hiburan tanpa rasa bersalah.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#107e59',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] antialiased">
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}
