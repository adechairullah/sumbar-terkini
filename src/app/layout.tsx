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
    'Suara Terdepan Informasi, Politik & Berita Viral Sumatera Barat dan Nasional. Media kit resmi, tarif paid promote, analitik 330.200+ followers aktif, dan pemesanan online via WhatsApp.',
  keywords: [
    'Sumbar Terkini',
    'Media Kit Sumbar',
    'Paid Promote Padang',
    'Iklan Sumatera Barat',
    'Endorsement Minang',
    'Berita Viral Sumbar',
  ],
  icons: {
    icon: '/logo-sumbar-terkini.png',
    shortcut: '/logo-sumbar-terkini.png',
    apple: '/logo-sumbar-terkini.png',
  },
  openGraph: {
    title: 'Sumbar Terkini | Media Kit & Paid Promote Resmi 2026',
    description:
      'Suara Terdepan Informasi, Politik & Berita Viral Sumatera Barat dan Nasional. Jangkauan 330.200+ Followers Aktif lintas Instagram, TikTok, dan Facebook.',
    type: 'website',
    locale: 'id_ID',
    images: [
      {
        url: '/logo-sumbar-terkini.png',
        width: 800,
        height: 800,
        alt: 'Sumbar Terkini Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${spaceMono.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-paper text-ink min-h-screen selection:bg-mustard selection:text-ink">
        {children}
      </body>
    </html>
  );
}
