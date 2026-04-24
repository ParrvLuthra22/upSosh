import type { Metadata } from 'next';
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import SmoothScroll from '@/components/ui/SmoothScroll';
import CustomCursor from '@/components/ui/CustomCursor';
import ConditionalHeader from '@/components/ConditionalHeader';
import ConditionalFooter from '@/components/layout/ConditionalFooter';
import AuthBootstrap from '@/components/AuthBootstrap';
import { Toaster } from 'sonner';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono',
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${GeistSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg-primary text-ink-primary antialiased cursor-none md:cursor-none">
        <noscript>
          <div style={{ padding: '20px', textAlign: 'center', background: '#FF5A1F', color: '#FAFAF7' }}>
            JavaScript is disabled. For the best experience, please enable JavaScript or download our mobile app.
          </div>
        </noscript>
        <ThemeProvider>
          <AuthBootstrap />
          <SmoothScroll>
            {/* Skip navigation for keyboard/screen-reader users */}
            <a href="#main-content" className="skip-to-main">
              Skip to main content
            </a>
            <CustomCursor />
            <ConditionalHeader />
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <ConditionalFooter />
          </SmoothScroll>
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'font-sans text-sm',
              success: 'bg-[#1F5F3F] text-white border-0',
              error: 'bg-red-600 text-white border-0',
            },
          }}
        />
      </body>
    </html>
  );
}
