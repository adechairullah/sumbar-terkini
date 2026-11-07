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
  title: 'Sumbar Terkini | Creator Media Kit & Endorsement Hub',
  description: 'Official Media Kit, rate card interaktif, dan live engagement analytics Sumbar Terkini. Hubungi kami untuk kerjasama brand, liputan, dan endorsement.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${spaceMono.variable}`}>
      <body className="font-sans antialiased bg-paper text-ink min-h-screen">
        {children}
      </body>
    </html>
  );
}
