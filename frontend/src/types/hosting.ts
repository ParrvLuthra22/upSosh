import { z } from 'zod';

// --- Shared Schemas ---

export const CoordinatesSchema = z.object({
    lat: z.number(),
    lng: z.number(),
});

export const VenueSchema = z.object({
    name: z.string().min(1, "Venue name is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    coordinates: CoordinatesSchema.optional(),
});

export const TicketTierSchema = z.object({
    name: z.string().min(1, "Ticket name is required"),
    price: z.number().min(0, "Price cannot be negative"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    perks: z.array(z.string()).optional(),
    description: z.string().optional(),
});

export const EventPricingSchema = z.object({
    isFree: z.boolean(),
    ticketTiers: z.array(TicketTierSchema).optional(),
}).refine(data => data.isFree || (data.ticketTiers && data.ticketTiers.length > 0), {
    message: "Paid events must have at least one ticket tier",
    path: ["ticketTiers"],
});

export const EventMediaSchema = z.object({
    coverImage: z.string().url("Invalid cover image URL"),
    galleryImages: z.array(z.string().url()).optional(),
    videoUrl: z.string().url().optional(),
});

export const EventRequirementsSchema = z.object({
    specialInstructions: z.string().optional(),
    dresscode: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
});

// --- Event Submission Schema ---

export const EventSubmissionSchema = z.object({
    id: z.string().uuid().optional(), // Optional for creation
    hostId: z.string(),
    status: z.enum(['draft', 'pending', 'approved', 'rejected']).default('draft'),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),

    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    category: z.string().min(1, "Category is required"),
    type: z.enum(['formal', 'informal']),

    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    duration: z.number().min(15, "Duration must be at least 15 minutes"), // in minutes
    timezone: z.string(),

    venue: VenueSchema,
    pricing: EventPricingSchema,
    media: EventMediaSchema,

    tags: z.array(z.string()).max(5, "Max 5 tags allowed"),
    capacity: z.number().int().positive("Capacity must be positive"),
    ageRestriction: z.number().int().min(0).optional(),

    requirements: EventRequirementsSchema.optional(),
    hostNotes: z.string().optional(),
    cancellationPolicy: z.string().optional(),
});

export type EventSubmission = z.infer<typeof EventSubmissionSchema>;
export type Venue = z.infer<typeof VenueSchema>;
export type TicketTier = z.infer<typeof TicketTierSchema>;

// --- Host Profile Schema ---

export const SocialLinksSchema = z.object({
    website: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
});

export const BankDetailsSchema = z.object({
    accountName: z.string(),
    accountNumber: z.string(), // Mocked
    routingNumber: z.string(), // Mocked
    bankName: z.string(),
});

export const HostProfileSchema = z.object({
    id: z.string().uuid().optional(),
    userId: z.string(),
    displayName: z.string().min(2, "Display name too short"),
    bio: z.string().max(500, "Bio too long").optional(),
    avatar: z.string().url().optional(),
    verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).default('unverified'),

    rating: z.number().min(0).max(5).default(0),
    totalEvents: z.number().int().default(0),
    badges: z.array(z.string()).default([]),

    socialLinks: SocialLinksSchema.optional(),
    bankDetails: BankDetailsSchema.optional(), // Required for paid events
    taxInfo: z.object({
        taxId: z.string().optional(), // Mocked
    }).optional(),
});

export type HostProfile = z.infer<typeof HostProfileSchema>;

// --- Event Analytics Schema ---

export const EventAnalyticsSchema = z.object({
    eventId: z.string(),
    views: z.number().int().default(0),
    saves: z.number().int().default(0),
    clicks: z.number().int().default(0),
    bookings: z.number().int().default(0),
    revenue: z.number().default(0),
});

export type EventAnalytics = z.infer<typeof EventAnalyticsSchema>;

// --- Validators ---

export const validateEventSubmission = (data: unknown) => EventSubmissionSchema.safeParse(data);
export const validateHostProfile = (data: unknown) => HostProfileSchema.safeParse(data);
