'use client';

import { useState, useMemo } from 'react';
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

function applyFilters(
  events: MockEvent[],
  filters: FilterState,
  searchQuery: string
): MockEvent[] {
  return events.filter((ev) => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchable = [ev.title, ev.category, ev.location, ev.city, ...ev.tags].join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Category
    if (filters.category !== 'All' && ev.category !== filters.category) return false;

    // Price
    if (ev.price !== 'Free' && ev.price > filters.priceMax) return false;

    // Host type filters
    if (filters.superhost && !ev.host.superhost) return false;
    if (filters.verified && !ev.host.verified) return false;
    if (filters.newHosts && !ev.host.newHost) return false;

    return true;
  });
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredEvents = useMemo(
    () => applyFilters(mockEvents, filters, searchQuery),
    [filters, searchQuery]
  );

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero / Search */}
      <DiscoverHero searchQuery={searchQuery} onSearch={setSearchQuery} />

      {/* Sticky filter bar — categories, tonight, near me, view toggle */}
      <StickyFilterBar
        filters={filters}
        updateFilter={updateFilter}
        view={view}
        setView={setView}
        onShowMobileFilters={() => setSidebarOpen(true)}
      />

      {/* Content row: sidebar + feed */}
      <div className="flex min-h-0">
        <Sidebar
          filters={filters}
          updateFilter={updateFilter}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <EventFeed events={filteredEvents} view={view} />
      </div>

      {/* Floating AI assist button */}
      <AIAssistButton isOpen={aiOpen} onToggle={() => setAiOpen((v) => !v)} />
    </div>
  );
}
