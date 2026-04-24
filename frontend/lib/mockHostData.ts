// ─── Types ────────────────────────────────────────────────────────────────────

export interface HostProfile {
  name: string;
  firstName: string;
  initials: string;
  bio: string;
  rating: number;
  eventsHosted: number;
  isSuperhost: boolean;
  photo: string;
}

export interface HostStats {
  upcomingEvents: number;
  monthlyRevenue: number;
  totalAttendees: number;
  averageRating: number;
  trends: {
    upcomingEvents: number;   // % change
    monthlyRevenue: number;
    totalAttendees: number;
    averageRating: number;
  };
}

export interface HostEvent {
  id: string;
  title: string;
  date: string;
  dateShort: string;
  day: string;
  month: string;
  time: string;
  category: string;
  image: string;
  attendees: number;
  capacity: number;
  revenue: number;
  status: 'live' | 'draft' | 'full' | 'past';
}

export interface RevenuePoint {
  date: string;
  label: string;
  revenue: number;
}

export interface ActivityItem {
  id: string;
  time: string;
  minutesAgo: number;
  type: 'booking' | 'review' | 'cancellation' | 'payout' | 'message';
  icon: string;
  text: string;
  accent?: string;
}

// ─── Host Profile ─────────────────────────────────────────────────────────────

export const mockHost: HostProfile = {
  name: 'Rhea Kapoor',
  firstName: 'Rhea',
  initials: 'RK',
  bio: 'Building community one curated event at a time. Based in Delhi, running the city\'s favourite Sunday run club.',
  rating: 4.9,
  eventsHosted: 14,
  isSuperhost: true,
  photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80',
};

// ─── Stats ────────────────────────────────────────────────────────────────────

export const mockStats: HostStats = {
  upcomingEvents: 3,
  monthlyRevenue: 42300,
  totalAttendees: 248,
  averageRating: 4.8,
  trends: {
    upcomingEvents: 50,
    monthlyRevenue: 18,
    totalAttendees: 12,
    averageRating: 2,
  },
};

// ─── Upcoming Events ──────────────────────────────────────────────────────────

export const mockHostEvents: HostEvent[] = [
  {
    id: 'evt-001',
    title: 'Sunday Run Club at Lodhi Garden',
    date: 'Sunday, 24 Nov 2024',
    dateShort: 'Sun 24 Nov',
    day: '24',
    month: 'NOV',
    time: '6:30 AM',
    category: 'Run Club',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=280&fit=crop&q=80',
    attendees: 24,
    capacity: 30,
    revenue: 0,
    status: 'live',
  },
  {
    id: 'evt-008',
    title: 'Natural Wine & Design Workshop',
    date: 'Friday, 22 Nov 2024',
    dateShort: 'Fri 22 Nov',
    day: '22',
    month: 'NOV',
    time: '7:00 PM',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=280&fit=crop&q=80',
    attendees: 13,
    capacity: 20,
    revenue: 19487,
    status: 'live',
  },
  {
    id: 'evt-003',
    title: 'Brand Strategy Workshop — Build Your Narrative',
    date: 'Sunday, 1 Dec 2024',
    dateShort: 'Sun 1 Dec',
    day: '01',
    month: 'DEC',
    time: '2:00 PM',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=280&fit=crop&q=80',
    attendees: 8,
    capacity: 25,
    revenue: 7992,
    status: 'draft',
  },
  {
    id: 'evt-new',
    title: 'Delhi Sunset Photography Walk',
    date: 'Saturday, 7 Dec 2024',
    dateShort: 'Sat 7 Dec',
    day: '07',
    month: 'DEC',
    time: '5:00 PM',
    category: 'Meetup',
    image: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?w=400&h=280&fit=crop&q=80',
    attendees: 0,
    capacity: 20,
    revenue: 0,
    status: 'draft',
  },
];

// ─── Revenue Data ─────────────────────────────────────────────────────────────

function fmt(date: Date): string {
  return date.toISOString().split('T')[0];
}

function label(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const REVENUE_BASE = [
  0, 0, 2499, 0, 0, 0, 1499, 0, 2499, 0, 0, 0, 4998, 0, 0, 0, 1499,
  0, 2499, 0, 0, 0, 7497, 0, 1499, 0, 0, 0, 2499, 0, 0, 0, 4998, 0,
  1499, 0, 0, 2499, 0, 0, 0, 2499, 0, 9996, 0, 0, 0, 1499, 0, 2499,
  0, 0, 0, 4998, 0, 0, 1499, 0, 2499, 0, 0, 0, 7497, 0, 1499, 0, 0,
  0, 2499, 0, 4998, 0, 0, 0, 1499, 2499, 0, 0, 0, 4998, 0, 1499, 0,
  0, 2499, 0, 9996, 0, 0, 0, 1499, 0,
];

export function generateRevenue(days: 7 | 30 | 90 | 365): RevenuePoint[] {
  const now = new Date(2024, 10, 21); // Nov 21 2024
  const source = REVENUE_BASE.slice(-days);
  return source.map((rev, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (source.length - 1 - i));
    return { date: fmt(d), label: label(d), revenue: rev };
  });
}

export const revenueData = {
  '7D': generateRevenue(7),
  '30D': generateRevenue(30),
  '3M': generateRevenue(90),
  All: generateRevenue(90),
};

// ─── Activity Feed ─────────────────────────────────────────────────────────────

export const mockActivity: ActivityItem[] = [
  {
    id: 'act-1',
    time: '2 hours ago',
    minutesAgo: 120,
    type: 'booking',
    icon: '🎟',
    text: '3 new bookings for Sunday Run Club',
    accent: '#FF5A1F',
  },
  {
    id: 'act-2',
    time: '5 hours ago',
    minutesAgo: 300,
    type: 'review',
    icon: '★',
    text: 'Ananya M. left a 5-star review — "Best Sunday morning in months."',
    accent: '#F0C96A',
  },
  {
    id: 'act-3',
    time: 'Yesterday',
    minutesAgo: 1440,
    type: 'payout',
    icon: '₹',
    text: '₹19,487 payout initiated for Natural Wine & Design Workshop',
    accent: '#1F5F3F',
  },
  {
    id: 'act-4',
    time: 'Yesterday',
    minutesAgo: 1560,
    type: 'cancellation',
    icon: '✕',
    text: '1 cancellation for Natural Wine & Design Workshop',
    accent: '#6B6B6B',
  },
  {
    id: 'act-5',
    time: '2 days ago',
    minutesAgo: 2880,
    type: 'booking',
    icon: '🎟',
    text: '2 bookings for Brand Strategy Workshop',
    accent: '#FF5A1F',
  },
  {
    id: 'act-6',
    time: '3 days ago',
    minutesAgo: 4320,
    type: 'review',
    icon: '★',
    text: 'Rahul K. left a 5-star review — "Exactly what I needed."',
    accent: '#F0C96A',
  },
  {
    id: 'act-7',
    time: '4 days ago',
    minutesAgo: 5760,
    type: 'message',
    icon: '💬',
    text: 'Priya S. sent a message about Sunday Run Club',
    accent: '#A8A29E',
  },
];
