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
    paymentProof?: string; // Base64 image for manual payment
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
            console.log('Attempting login to:', `${API_URL}/auth/login`);
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                credentials: 'include',
            });
            
            console.log('Login response status:', res.status);
            
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned invalid response. Please try again.');
            }
            
            const data = await res.json();
            console.log('Login response data:', data);
            
            if (!res.ok) throw new Error(data.message || 'Login failed');
            return data;
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    },

    signup: async (data: any) => {
        try {
            console.log('Attempting signup to:', `${API_URL}/auth/signup`);
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            
            console.log('Signup response status:', res.status);
            
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned invalid response. Please try again.');
            }
            
            const responseData = await res.json();
            console.log('Signup response data:', responseData);
            
            if (!res.ok) throw new Error(responseData.message || 'Signup failed');
            return responseData;
        } catch (error: any) {
            console.error('Signup error:', error);
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
        const res = await fetch(`${API_URL}/bookings`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch bookings');
        return res.json();
    },
    createBooking: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers,
            body: JSON.stringify(booking),
            credentials: 'include',
        });

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text();
            console.error('Non-JSON response from create booking:', text);
            throw new Error('Server returned invalid response. Please try again.');
        }

        if (!res.ok) {
            const error = await res.json();
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
        const res = await fetch(`${API_URL}/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || data.details || 'Failed to update event');
        }
        return data;
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
        // Try to get token from localStorage
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
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
            // Try to get token from localStorage as fallback
            const storedUserData = localStorage.getItem('userData');
            let headers: Record<string, string> = { 'Content-Type': 'application/json' };
            
            if (storedUserData) {
                try {
                    const userData = JSON.parse(storedUserData);
                    // If we have a token stored, use it
                    const token = localStorage.getItem('token');
                    if (token) {
                        headers['Authorization'] = `Bearer ${token}`;
                    }
                } catch (e) {
                    console.error('Error parsing userData:', e);
                }
            }
            
            const res = await fetch(`${API_URL}/auth/me`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(profileData),
                credentials: 'include',
            });
            
            const data = await res.json();
            if (!res.ok) {
                console.error('Update profile failed:', data);
                throw new Error(data.message || 'Failed to update profile');
            }
            return data;
        } catch (error: any) {
            console.error('Update profile error:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            throw error;
        }
    },

    // RAZORPAY PAYMENT METHODS COMMENTED OUT - Using manual payment verification
    // Uncomment when Razorpay is approved
    
    // createPaymentOrder: async (amount: number, currency = 'INR') => {
    //     const token = localStorage.getItem('token');
    //     const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    //     
    //     if (token) {
    //         headers['Authorization'] = `Bearer ${token}`;
    //     }

    //     const res = await fetch(`${API_URL}/payments/create-order`, {
    //         method: 'POST',
    //         headers,
    //         body: JSON.stringify({ amount, currency }),
    //         credentials: 'include',
    //     });

    //     const contentType = res.headers.get('content-type');
    //     if (!contentType || !contentType.includes('application/json')) {
    //         const text = await res.text();
    //         console.error('Non-JSON response from payment order:', text);
    //         throw new Error('Server returned invalid response. Please ensure you are logged in.');
    //     }

    //     if (!res.ok) {
    //         const error = await res.json();
    //         throw new Error(error.error || 'Failed to create payment order');
    //     }

    //     return res.json();
    // },

    // verifyPayment: async (paymentData: {
    //     razorpay_order_id: string;
    //     razorpay_payment_id: string;
    //     razorpay_signature: string;
    // }) => {
    //     const token = localStorage.getItem('token');
    //     const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    //     
    //     if (token) {
    //         headers['Authorization'] = `Bearer ${token}`;
    //     }

    //     const res = await fetch(`${API_URL}/payments/verify-payment`, {
    //         method: 'POST',
    //         headers,
    //         body: JSON.stringify(paymentData),
    //         credentials: 'include',
    //     });

    //     const contentType = res.headers.get('content-type');
    //     if (!contentType || !contentType.includes('application/json')) {
    //         const text = await res.text();
    //         console.error('Non-JSON response from payment verify:', text);
    //         throw new Error('Server returned invalid response. Please contact support.');
    //     }

    //     if (!res.ok) {
    //         const error = await res.json();
    //         throw new Error(error.error || 'Failed to verify payment');
    //     }

    //     return res.json();
    // },

    // getPaymentDetails: async (paymentId: string) => {
    //     const token = localStorage.getItem('token');
    //     const headers: Record<string, string> = {};
    //     
    //     if (token) {
    //         headers['Authorization'] = `Bearer ${token}`;
    //     }

    //     const res = await fetch(`${API_URL}/payments/payment/${paymentId}`, {
    //         headers,
    //         credentials: 'include',
    //     });

    //     if (!res.ok) {
    //         const error = await res.json();
    //         throw new Error(error.error || 'Failed to fetch payment details');
    //     }

    //     return res.json();
    // }
};
