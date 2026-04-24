'use client';

import { useState, useMemo, useEffect } from 'react';
import DiscoverHero from '@/components/discover/DiscoverHero';
import StickyFilterBar from '@/components/discover/StickyFilterBar';
import Sidebar from '@/components/discover/Sidebar';
import EventFeed from '@/components/discover/EventFeed';
import AIAssistButton from '@/components/discover/AIAssistButton';
import { mockEvents, MockEvent } from '@/lib/mockEvents';

export interface FilterState {
  category: string;
  tonight: boolean;
  nearMe: boolean;
  priceMax: number;
  dateFilter: 'any' | 'today' | 'tomorrow' | 'weekend';
  distance: number;
  verified: boolean;
  superhost: boolean;
  newHosts: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  category: 'All',
  tonight: false,
  nearMe: false,
  priceMax: 5000,
  dateFilter: 'any',
  distance: 20,
  verified: false,
  superhost: false,
  newHosts: false,
};

function applyFilters(events: MockEvent[], filters: FilterState, searchQuery: string): MockEvent[] {
  return events.filter((ev) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchable = [ev.title, ev.category, ev.location, ev.city, ...ev.tags].join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    if (filters.category !== 'All' && ev.category !== filters.category) return false;
    if (ev.price !== 'Free' && ev.price > filters.priceMax) return false;
    if (filters.superhost && !ev.host.superhost) return false;
    if (filters.verified && !ev.host.verified) return false;
    if (filters.newHosts && !ev.host.newHost) return false;
    return true;
  });
}

// Normalise a raw API event into MockEvent shape
function normaliseApiEvent(raw: any): MockEvent {
  const d = raw.date ? new Date(raw.date) : null;
  return {
    id: raw.id ?? raw._id,
    title: raw.title,
    category: raw.category ?? 'Social',
    host: {
      name: raw.hostName ?? raw.host?.name ?? 'Host',
      initials: (raw.hostName ?? raw.host?.name ?? 'H').slice(0, 2).toUpperCase(),
      verified: raw.host?.verified ?? raw.hostVerified ?? false,
      superhost: raw.host?.superhost ?? raw.isSuperhost ?? false,
      newHost: raw.host?.newHost ?? false,
    },
    date: d ? d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '',
    dateShort: d ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '',
    time: raw.time ?? (d ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''),
    location: raw.location ?? '',
    city: raw.city ?? raw.location?.split(',').pop()?.trim() ?? '',
    price: raw.price === 0 || raw.isFree ? 'Free' : (raw.price ?? 'Free'),
    spots: raw.capacity ?? 30,
    spotsLeft: raw.spotsLeft ?? (raw.capacity ?? 30) - (raw.bookingsCount ?? 0),
    going: raw.bookingsCount ?? 0,
    image: raw.image ?? raw.coverImage ?? 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=560&fit=crop&q=80',
    tags: raw.tags ?? [],
    featured: raw.featured ?? false,
  };
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [events, setEvents] = useState<MockEvent[]>(mockEvents);
  const [apiLoading, setApiLoading] = useState(true);

  // Fetch from real API, fall back to mock
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/events?limit=50', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const rawList: any[] = data.events ?? data.data ?? [];
          if (rawList.length > 0) {
            setEvents(rawList.map(normaliseApiEvent));
          }
          // if 0 events returned keep mock data
        }
      } catch {
        // network error — keep mock data
      } finally {
        setApiLoading(false);
      }
    };
    load();
  }, []);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredEvents = useMemo(
    () => applyFilters(events, filters, searchQuery),
    [filters, searchQuery, events]
  );

  return (
    <div className="min-h-screen bg-bg-primary">
      <DiscoverHero searchQuery={searchQuery} onSearch={setSearchQuery} />

      <StickyFilterBar
        filters={filters}
        updateFilter={updateFilter}
        view={view}
        setView={setView}
        onShowMobileFilters={() => setSidebarOpen(true)}
      />

      <div className="flex min-h-0">
        <Sidebar
          filters={filters}
          updateFilter={updateFilter}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <EventFeed
          events={apiLoading ? [] : filteredEvents}
          view={view}
        />
      </div>

      <AIAssistButton isOpen={aiOpen} onToggle={() => setAiOpen((v) => !v)} />
    </div>
  );
}
