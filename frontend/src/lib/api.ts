const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'https://upsosh-production.up.railway.app/api';

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
    login: async (credentials: any) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        return data;
    },

    signup: async (data: any) => {
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        const responseData = await res.json();
        if (!res.ok) throw new Error(responseData.message || 'Signup failed');
        return responseData;
    },

    getEvents: async (): Promise<Event[]> => {
        const res = await fetch(`${API_URL}/events`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch events');
        return res.json();
    },

    getEventById: async (id: string): Promise<Event> => {
        const res = await fetch(`${API_URL}/events/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch event');
        return res.json();
    },

    getHosts: async (): Promise<Host[]> => {
        const res = await fetch(`${API_URL}/hosts`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch hosts');
        return res.json();
    },

    getHostById: async (id: string): Promise<Host> => {
        const res = await fetch(`${API_URL}/hosts/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch host');
        return res.json();
    },

    getBookings: async (): Promise<Booking[]> => {
        const res = await fetch(`${API_URL}/bookings`, { credentials: 'include' });
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
            credentials: 'include',
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
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || data.details || 'Failed to create event');
        }
        return data;
    },

    getMe: async () => {
        const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (!res.ok) return null;
        return res.json();
    },

    logout: async () => {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    },

    resetPassword: async (email: string, newPassword: string, confirmPassword: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword, confirmPassword }),
                credentials: 'include',
            });
            
            // Check if response is JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Backend server is not responding. Please make sure the backend is running on https://upsosh-production.up.railway.app/api');
            }
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to reset password');
            return data;
        } catch (error: any) {
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            throw error;
        }
    }
};

