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
    paymentProof?: string; 
    customer?: {
        name: string;
        email: string;
        phone: string;
    };
    createdAt: string;
}

export const api = {
    login: async (credentials: any) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                credentials: 'include',
            });
            
            
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('Expected JSON, got a non-JSON response');
                throw new Error('Server returned invalid response. Please try again.');
            }
            
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Login failed');
            return data;
        } catch (error: any) {
            console.error('Login request failed');
            throw error;
        }
    },

    signup: async (data: any) => {
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            
            
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('Expected JSON, got a non-JSON response');
                throw new Error('Server returned invalid response. Please try again.');
            }
            
            const responseData = await res.json();
            
            if (!res.ok) throw new Error(responseData.message || 'Signup failed');
            return responseData;
        } catch (error: any) {
            console.error('Signup request failed');
            throw error;
        }
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
        const headers: Record<string, string> = {};

        const res = await fetch(`${API_URL}/bookings`, { 
            credentials: 'include',
            headers
        });
        if (!res.ok) throw new Error('Failed to fetch bookings');
        return res.json();
    },
    createBooking: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers,
            body: JSON.stringify(booking),
            credentials: 'include',
        });

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text();
            console.error('Expected JSON from create booking, got a non-JSON response');
            throw new Error('Server returned invalid response. Please try again.');
        }

        if (!res.ok) {
            const error = await res.json();
            
            if (res.status === 401 && error.reason?.includes('expired')) {
                throw new Error('Session expired. Please log in again.');
            }
            throw new Error(error.message || error.error || 'Failed to create booking');
        }
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

    updateEvent: async (eventId: string, event: Partial<Event>): Promise<Event> => {
        try {
            
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); 
            
            const res = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
                credentials: 'include',
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || data.details || 'Failed to update event');
            }
            return data;
        } catch (error: any) {
            console.error('Update event request failed');
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. The server took too long to respond. This might be due to a large image size. Try using a smaller image or an image URL instead.');
            }
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            throw error;
        }
    },

    deleteEvent: async (eventId: string): Promise<void> => {
        const res = await fetch(`${API_URL}/events/${eventId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete event');
        }
    },

    getMe: async () => {
        
        const headers: Record<string, string> = {};
        
        const res = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include',
            headers
        });
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
    },

    updateProfile: async (profileData: {
        name?: string;
        bio?: string;
        avatar?: string;
        isHost?: boolean;
        hostName?: string;
        hostBio?: string;
    }) => {
        try {
            // Auth comes from the httpOnly cookie via credentials: 'include'.
            // This used to read a JWT (and a parsed-but-unused userData blob)
            // out of localStorage to build a bearer header.
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };

            const res = await fetch(`${API_URL}/auth/me`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(profileData),
                credentials: 'include',
            });
            
            const data = await res.json();
            if (!res.ok) {
                console.error('Update profile failed');
                throw new Error(data.message || 'Failed to update profile');
            }
            return data;
        } catch (error: any) {
            console.error('Update profile request failed');
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            throw error;
        }
    },

    
    
    createDodoCheckout: async (data: {
        items: Array<{ id: string; title: string; price: number; qty: number; }>;
        customer: { name: string; email: string; phone?: string; };
        returnUrl?: string;
        metadata?: Record<string, string>;
    }) => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };

        const res = await fetch(`${API_URL}/payments/create-checkout`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
            credentials: 'include',
        });

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text();
            console.error('Expected JSON from checkout, got a non-JSON response');
            throw new Error('Server returned invalid response. Please try again.');
        }

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create checkout session');
        }

        return res.json();
    },

    
    getDodoPaymentStatus: async (paymentId: string) => {
        const headers: Record<string, string> = {};

        const res = await fetch(`${API_URL}/payments/status/${paymentId}`, {
            headers,
            credentials: 'include',
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to fetch payment status');
        }

        return res.json();
    },

    // ─── Generic typed methods (used by new feature pages) ───────────────────
    get: async <T>(path: string): Promise<T> => {
        const headers: Record<string, string> = {};
        const res = await fetch(path, { credentials: 'include', headers });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as any).message ?? `HTTP ${res.status}`);
        }
        return res.json();
    },

    post: async <T>(path: string, body?: unknown): Promise<T> => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const res = await fetch(path, { method: 'POST', headers, body: body ? JSON.stringify(body) : undefined, credentials: 'include' });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as any).message ?? `HTTP ${res.status}`);
        }
        return res.json();
    },

    patch: async <T>(path: string, body?: unknown): Promise<T> => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const res = await fetch(path, { method: 'PATCH', headers, body: body ? JSON.stringify(body) : undefined, credentials: 'include' });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as any).message ?? `HTTP ${res.status}`);
        }
        return res.json();
    },

    delete: async <T>(path: string): Promise<T> => {
        const headers: Record<string, string> = {};
        const res = await fetch(path, { method: 'DELETE', headers, credentials: 'include' });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as any).message ?? `HTTP ${res.status}`);
        }
        return res.json();
    },
};

