const API_URL = '/api';

export interface Event {
    id: string;
    title: string;
    type: 'formal' | 'informal';
    date: string;
    time: string;
    venue: string;
    hostId: string;
    price: number;
    description: string;
    image: string;
    tags: string[];
    isSuperhost: boolean;
}

export interface Host {
    id: string;
    name: string;
    verified: boolean;
    avatar: string;
}

export interface BookingItem extends Event {
    qty: number;
}

export interface Booking {
    id: string;
    userId: string;
    items: BookingItem[];
    totalAmount: number;
    status: 'confirmed' | 'pending' | 'cancelled';
    paymentId?: string;
    customer?: {
        name: string;
        email: string;
        phone: string;
    };
    createdAt: string;
}

export const api = {
    getEvents: async (): Promise<Event[]> => {
        const res = await fetch(`${API_URL}/events`);
        if (!res.ok) throw new Error('Failed to fetch events');
        return res.json();
    },

    getEventById: async (id: string): Promise<Event> => {
        const res = await fetch(`${API_URL}/events/${id}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        return res.json();
    },

    getHosts: async (): Promise<Host[]> => {
        const res = await fetch(`${API_URL}/hosts`);
        if (!res.ok) throw new Error('Failed to fetch hosts');
        return res.json();
    },

    getHostById: async (id: string): Promise<Host> => {
        const res = await fetch(`${API_URL}/hosts/${id}`);
        if (!res.ok) throw new Error('Failed to fetch host');
        return res.json();
    },

    getBookings: async (): Promise<Booking[]> => {
        const res = await fetch(`${API_URL}/bookings`);
        if (!res.ok) throw new Error('Failed to fetch bookings');
        return res.json();
    },
    createBooking: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(booking),
        });
        if (!res.ok) throw new Error('Failed to create booking');
        return res.json();
    },

    createEvent: async (event: Omit<Event, 'id'>): Promise<Event> => {
        const res = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });
        if (!res.ok) throw new Error('Failed to create event');
        return res.json();
    },

    getMe: async () => {
        const res = await fetch(`${API_URL}/auth/me`);
        if (!res.ok) return null;
        return res.json();
    },

    logout: async () => {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
    }
};

