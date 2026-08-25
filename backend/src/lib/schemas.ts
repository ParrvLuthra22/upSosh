import { z } from 'zod';

// ─── auth.ts ──────────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signinSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email and password are required'),
  password: z.string().min(1, 'Email and password are required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token and new password are required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ─── users.ts — PATCH /me ────────────────────────────────────────────────────
// Same 16-key allow-list the handler used to enforce by hand (picking keys
// off req.body with no type or value check at all) — now every key also has
// a real type, so e.g. `wantsToHost: "yes"` is rejected instead of being
// written to a Boolean column as a truthy string.

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  bio: z.string().trim().max(500).optional(),
  photoUrl: z.string().url().optional(),
  city: z.string().trim().optional(),
  groupSize: z.enum(['intimate', 'larger']).optional(),
  vibe: z.enum(['chill', 'structured']).optional(),
  frequency: z.enum(['weekly', 'occasional']).optional(),
  wantsToHost: z.boolean().optional(),
  hostBio: z.string().trim().optional(),
  hostExperience: z.enum(['first', 'few', 'experienced']).optional(),
  hostCategories: z.string().optional(), // JSON-encoded array, stored as-is
  hostInstagram: z.string().trim().optional(),
  hostLinkedin: z.string().trim().optional(),
  hostWebsite: z.string().trim().optional(),
  onboardingComplete: z.boolean().optional(),
  interests: z.string().optional(), // JSON-encoded array, stored as-is
});

// ─── events.ts ────────────────────────────────────────────────────────────────

const futureDate = z.coerce.date().refine((d) => d > new Date(), {
  message: 'Date must be a valid future date',
});

export const createEventSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters'),
  type: z.string().min(1, 'Event type is required'),
  category: z.string().optional(),
  date: futureDate,
  time: z.string().default('00:00'),
  venue: z.string().trim().min(1, 'Venue is required'),
  city: z.string().default('Delhi'),
  price: z.coerce.number().min(0, 'Price cannot be negative').default(0),
  isFree: z.boolean().default(false),
  description: z.string().trim().min(1, 'Description is required'),
  image: z.string().default('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'),
  tags: z.union([z.array(z.string()), z.string()]).default('[]'),
  capacity: z.coerce.number().int().min(2, 'Capacity must be between 2 and 500').max(500, 'Capacity must be between 2 and 500').default(30),
  status: z.enum(['draft', 'live', 'full', 'past', 'cancelled']).default('live'),
  isSuperhost: z.boolean().default(false),
}).transform((data) => ({
  ...data,
  category: data.category || data.type,
  isFree: data.isFree || data.price === 0,
  tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags,
}));

export const updateEventSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  date: z.coerce.date().optional(),
  time: z.string().optional(),
  venue: z.string().trim().min(1).optional(),
  city: z.string().optional(),
  price: z.coerce.number().min(0, 'Price cannot be negative').optional(),
  isFree: z.boolean().optional(),
  description: z.string().trim().min(1).optional(),
  image: z.string().optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  capacity: z.coerce.number().int().min(2).max(500).optional(),
  status: z.enum(['draft', 'live', 'full', 'past', 'cancelled']).optional(),
  isSuperhost: z.boolean().optional(),
});

// ─── bookings.ts ──────────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  eventId: z.string().trim().min(1).optional(),
  guestName: z.string().trim().min(1, 'guestName, guestEmail, and guestPhone are required'),
  guestEmail: z.string().trim().toLowerCase().email('guestEmail must be a valid email'),
  guestPhone: z.string().trim().min(1, 'guestName, guestEmail, and guestPhone are required'),
  notes: z.string().trim().optional(),
  paymentMethod: z.enum(['razorpay', 'upi', 'free']).optional(),
});

// ─── hosts.ts — POST /apply ───────────────────────────────────────────────────

const sampleEventSchema = z.object({
  title: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  time: z.string().optional(),
  venue: z.string().optional(),
  city: z.string().optional(),
  capacity: z.coerce.number().int().optional(),
  isFree: z.boolean().optional(),
  price: z.coerce.number().optional(),
}).optional();

export const hostApplySchema = z.object({
  govIdUrl: z.string().trim().optional(),
  selfieUrl: z.string().trim().optional(),
  bio: z.string().trim().min(1, 'Bio and experience are required'),
  experience: z.string().trim().min(1, 'Bio and experience are required'),
  categories: z.union([z.array(z.string()), z.string()]).optional(),
  instagram: z.string().trim().optional(),
  linkedin: z.string().trim().optional(),
  website: z.string().trim().optional(),
  sampleEvent: sampleEventSchema,
});
