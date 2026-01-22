import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.upsosh.app'),
  title: {
    template: '%s | UpSosh',
    default: 'UpSosh',
  },
  description: 'Curated events, hosted by real people.',
  keywords: ['events', 'social', 'booking'],
  authors: [{ name: 'UpSosh' }],
  openGraph: {
    title: 'UpSosh',
    description: 'Curated events, hosted by real people.',
    url: 'https://www.upsosh.app/',
    siteName: 'UpSosh',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        <ThemeProvider>
          <SmoothScrollProvider>
            <Header />
            <main className="min-h-screen pt-20">
              {children}
            </main>
            <Footer />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
