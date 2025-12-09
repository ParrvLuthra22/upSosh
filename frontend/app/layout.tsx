import type { Metadata } from 'next';
import '@/src/styles/globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import Navigation from '@/components/Navigation'; // Keeping this if it's a different nav, otherwise might replace with Header
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';


export const metadata: Metadata = {
  metadataBase: new URL('https://upsosh.vercel.app'), // Placeholder URL
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
    url: 'https://upsosh.vercel.app',
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <noscript>
          <div style={{ padding: '20px', textAlign: 'center', background: '#f8d7da', color: '#721c24' }}>
            JavaScript is disabled. For the best experience, please enable JavaScript or download our mobile app.
          </div>
        </noscript>
        <ThemeProvider>
          <SmoothScrollProvider>
            <Header />
            <main className="min-h-screen pt-4">
              {children}
            </main>
            <Footer />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
