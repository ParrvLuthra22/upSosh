import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import Navigation from '@/components/Navigation'; // Keeping this if it's a different nav, otherwise might replace with Header
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';

// Load JetBrains Mono for body text - clean monospace
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-body',
});


export const metadata: Metadata = {
  metadataBase: new URL('https://www.upsosh.app'), 
  title: {
    template: '%s | UpSosh',
    default: 'UpSosh - Discover & Book Exclusive Events',
  },
  description: 'Discover formal + informal events around you — all in one place. House parties, meetups, workshops, and formal events.',
  keywords: ['events', 'parties', 'meetups', 'workshops', 'networking', 'social', 'booking', 'tickets'],
  authors: [{ name: 'UpSosh Team' }],
  creator: 'UpSosh',
  publisher: 'UpSosh',
  openGraph: {
    title: 'UpSosh - Switch Up Your Experiences',
    description: 'Discover formal + informal events around you — all in one place.',
    url: 'https://www.upsosh.app/',
    siteName: 'UpSosh',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UpSosh - Switch Up Your Experiences',
    description: 'Discover formal + informal events around you — all in one place.',
    creator: '@upsosh',
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
    <html lang="en" suppressHydrationWarning className={`dark ${jetbrainsMono.variable}`}>
      <head>
        {/* Preconnect for Google Fonts performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Jersey 10 for animated/highlight text */}
        <link href="https://fonts.googleapis.com/css2?family=Jersey+10&display=swap" rel="stylesheet" />
        {/* BBH Bartle font is loaded via @font-face in globals.css from /fonts/BBHBartle-Regular.ttf */}
      </head>
      <body className={`bg-black text-white font-body ${jetbrainsMono.className}`}>
        <noscript>
          <div style={{ padding: '20px', textAlign: 'center', background: '#D4A017', color: '#000000' }}>
            JavaScript is disabled. For the best experience, please enable JavaScript or download our mobile app.
          </div>
        </noscript>
        <ThemeProvider>
          <SmoothScrollProvider>
            <Header />
            <main className="min-h-screen pt-4 bg-black">
              {children}
            </main>
            <Footer />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
