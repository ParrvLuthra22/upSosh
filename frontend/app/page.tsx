'use client';

import React, { useEffect } from 'react';
import Hero from '@/src/components/Hero';
import EventGrid from '@/src/components/booking/EventGrid';
import { useBookingStore } from '@/src/store/bookingStore';
import { api } from '@/src/lib/api';
import { generateOrganizationSchema } from '@/src/lib/structuredData';
import Link from 'next/link';

// Simple text block component for editorial content
const EditorialBlock = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="py-24 border-t border-border">
    <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
      <div className="md:col-span-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="md:col-span-8">
        <div className="text-xl leading-relaxed text-foreground/80 font-light max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const { setEvents } = useBookingStore();

  // Load events on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const events = await api.getEvents();
        setEvents(events);
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };
    loadEvents();
  }, [setEvents]);

  return (
    <main className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
      />

      <Hero />

      {/* Events Section - "Explore" */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="mb-12 flex items-end justify-between border-b border-border pb-6">
            <h2 className="text-3xl font-medium tracking-tight text-foreground">Upcoming Events</h2>
            <Link href="/booking" className="hidden md:inline-block text-sm font-medium text-foreground hover:opacity-70 transition-opacity">
              View all events &rarr;
            </Link>
          </div>

          <EventGrid />

          <div className="mt-12 text-center md:hidden">
            <Link href="/booking" className="btn-reset bg-foreground text-background px-6 py-3 rounded-full">
              View all events
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Content Blocks - Replacing Features Grid */}
      <section className="mt-12">
        <EditorialBlock title="Curated for Quality">
          <p>
            We believe that the best events are those that bring people together in meaningful ways.
            Every event on UpSosh is vetted to ensure a high-quality experience, whether it's a
            professional workshop or an intimate social gathering.
          </p>
        </EditorialBlock>

        <EditorialBlock title="Seamless Booking">
          <p>
            Booking shouldn't be a hassle. With our streamlined process, you can secure your spot
            in seconds. No hidden fees, no complicated forms—just a straightforward path to
            your next experience.
          </p>
        </EditorialBlock>

        <EditorialBlock title="Trust & Safety">
          <p>
            Your safety is our priority. All hosts are verified, and we provide clear, transparent
            information about every venue and organizer. Book with confidence knowing you're in good hands.
          </p>
        </EditorialBlock>
      </section>
    </main>
  );
}
