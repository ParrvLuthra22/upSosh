import type { Metadata } from 'next';
import DiscoverPageClient from './DiscoverPageClient';

export const metadata: Metadata = {
  title: 'Discover events',
  description:
    'Browse formal and informal micro-events near you — house parties, meetups, workshops, run clubs, and dinners. Filter by date, city, and category.',
  openGraph: {
    title: 'Discover events | UpSosh',
    description: 'Browse formal and informal micro-events near you, curated and ready to book.',
    type: 'website',
  },
};

export default function DiscoverPage() {
  return <DiscoverPageClient />;
}
