// ─── Enums & Unions ───────────────────────────────────────────────────────────

export type Category =
  | 'run_clubs'
  | 'creator_meetups'
  | 'workshops'
  | 'dinners'
  | 'book_clubs'
  | 'fitness'
  | 'social'
  | 'wellness';

export type EventStatus =
  | 'draft'
  | 'published'
  | 'sold_out'
  | 'cancelled'
  | 'completed';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod =
  | 'razorpay'
  | 'upi'
  | 'card'
  | 'free';

export type UserRole = 'host' | 'attendee' | 'both';

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Host {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  isSuperhost: boolean;
  eventsHosted: number;
  rating: number;            // 0–5, one decimal
  bio: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  host: Host;
  date: Date;
  time: string;              // e.g. "7:00 PM"
  price: number;             // 0 for free events
  currency: string;          // e.g. "INR", "USD"
  location: string;          // human-readable address / neighbourhood
  venue: string;             // specific venue name
  category: Category;
  imageUrl: string;
  attendeeCount: number;
  maxCapacity: number;
  spotsLeft: number;
  isInstantBooking: boolean; // true = no approval needed
  status: EventStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  // avatar is optional so legacy backend responses (which use photoUrl) still
  // satisfy the type — components should prefer avatar, fall back to photoUrl
  avatar?: string;
  role?: UserRole;

  // ── Backend / legacy optional fields ──────────────────────────────────────
  /** Alias used by the backend and older code — prefer avatar when present */
  photoUrl?: string;
  username?: string;
  bio?: string;
  location?: string;
  hostBio?: string;
  isSuperhost?: boolean;
  /** Host onboarding state returned by /api/auth/me */
  hostStatus?: 'none' | 'pending' | 'verified';
  onboardingComplete?: boolean;
}

export interface GuestDetail {
  name: string;
  email?: string;
  phone?: string;
}

export interface Booking {
  id: string;
  event: Event;
  user: User;
  guestCount: number;
  guestDetails: GuestDetail[];
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  amount: number;            // total charged (price × guestCount)
  createdAt: Date;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

/** Paginated list wrapper — use when the API returns a list with pagination. */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
