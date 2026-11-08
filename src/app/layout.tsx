import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Space_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sumbar Terkini | Media Kit & Paid Promote Resmi 2026',
  description:
    'Suara Terdepan Informasi, Politik & Berita Viral Sumatera Barat dan Nasional. Media kit resmi, tarif paid promote, analitik jangkauan 330.200+ followers aktif, dan pemesanan iklan online via WhatsApp.',
  keywords: [
    'Sumbar Terkini',
    'Media Kit Sumbar',
    'Paid Promote Padang',
    'Iklan Sumatera Barat',
    'Endorsement Minang',
    'Berita Viral Sumbar',
  ],
  openGraph: {
    title: 'Sumbar Terkini | Media Kit & Paid Promote Resmi 2026',
    description:
      'Suara Terdepan Informasi, Politik & Berita Viral Sumatera Barat dan Nasional. Jangkauan 330.200+ Followers Aktif lintas Instagram, TikTok, dan Facebook.',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${spaceMono.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
