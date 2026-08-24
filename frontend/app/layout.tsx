import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import SmoothScroll from '@/components/ui/SmoothScroll';
import CustomCursor from '@/components/ui/CustomCursor';
import ConditionalHeader from '@/components/ConditionalHeader';
import ConditionalFooter from '@/components/layout/ConditionalFooter';
import AuthProvider from '@/components/providers/AuthProvider';
import BookingFlow from '@/components/BookingFlow';
import IntroScreen from '@/components/IntroScreen';
import { Toaster } from 'sonner';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-fraunces',
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
      className={`${fraunces.variable} ${GeistSans.variable} ${GeistMono.variable}`}
      style={
        {
          '--font-geist': GeistSans.style.fontFamily,
          '--font-geist-mono': GeistMono.style.fontFamily,
        } as React.CSSProperties
      }
    >
      <body className="bg-void text-cream antialiased cursor-none md:cursor-none">
        <noscript>
          <div style={{ padding: '20px', textAlign: 'center', background: 'var(--lime)', color: 'var(--void)' }}>
            JavaScript is disabled. For the best experience, please enable JavaScript or download our mobile app.
          </div>
        </noscript>
        <IntroScreen />
        <AuthProvider>
        <SmoothScroll>
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
        </AuthProvider>
        {/* Global booking modal — controlled by useBookingStore */}
        <BookingFlow />
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'font-sans text-sm',
              success: 'bg-emerald-600 text-white border-0',
              error: 'bg-coral text-white border-0',
            },
          }}
        />
      </body>
    </html>
  );
}
