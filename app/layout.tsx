import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-plus-jakarta',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Mini Inventory Manager — Sistem Inventori Stok & Peringatan Habis',
  description:
    'Sistem Inventori Stok & Peringatan Habis untuk pengurusan stok kedai koperasi, kit bengkel, dan bahan mentah kafe.',
  openGraph: {
    title: 'Mini Inventory Manager',
    description:
      'Sistem Inventori Stok & Peringatan Habis untuk pengurusan stok kedai koperasi, kit bengkel, dan bahan mentah kafe.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mini Inventory Manager',
    description:
      'Sistem Inventori Stok & Peringatan Habis untuk pengurusan stok kedai koperasi, kit bengkel, dan bahan mentah kafe.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ms"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
