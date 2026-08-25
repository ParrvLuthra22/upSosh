import type { Metadata } from 'next';
import EventPageClient from './EventPageClient';

async function fetchEventForMetadata(slug: string): Promise<any | null> {
  try {
    // A server-side fetch (this runs during SSR, not in the browser) can't
    // resolve a relative URL the way the client-side rewrite proxy does —
    // NEXT_PUBLIC_API_URL is deliberately empty for that proxy and would
    // make this throw. NEXT_PUBLIC_BACKEND_URL is the absolute origin.
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/api/events/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await fetchEventForMetadata(params.slug);

  if (!event) {
    return { title: 'Event not found' };
  }

  const title = event.title as string;
  const description: string =
    (event.description as string | undefined)?.slice(0, 160) ??
    `${title} — ${event.venue ?? event.city ?? 'an upSosh event'}. Book your spot.`;
  const image: string =
    event.image ?? 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80&fit=crop';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function EventDetailPage() {
  return <EventPageClient />;
}
