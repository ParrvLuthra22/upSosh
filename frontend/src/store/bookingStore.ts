import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Event } from '@/src/lib/api';

interface Filters {
    type: 'all' | 'formal' | 'informal';
    dateRange: { start: string | null; end: string | null };
    priceRange: { min: number; max: number };
    isSuperhost: boolean;
    sort: 'date' | 'price_asc' | 'price_desc';
}

export interface CartItem extends Event {
    qty: number;
}

interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
}

interface BookingState {
    events: Event[];
    filteredEvents: Event[];
    paginatedEvents: Event[];
    searchQuery: string;
    filters: Filters;
    pagination: PaginationState;
    cart: CartItem[];
    selectedEvent: Event | null;
    isCartOpen: boolean;
    isCheckoutOpen: boolean;

    setEvents: (events: Event[]) => void;
    setSearch: (query: string) => void;
    setFilters: (filters: Partial<Filters>) => void;
    setPage: (page: number) => void;
    addToCart: (event: Event, qty?: number) => void;
    removeFromCart: (eventId: string) => void;
    updateCartQty: (eventId: string, qty: number) => void;
    clearCart: () => void;
    applyFilters: () => void;
    setSelectedEvent: (event: Event | null) => void;
    toggleCart: (isOpen?: boolean) => void;
    toggleCheckout: (isOpen?: boolean) => void;
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            events: [],
            filteredEvents: [],
            paginatedEvents: [],
            searchQuery: '',
            filters: {
                type: 'all',
                dateRange: { start: null, end: null },
                priceRange: { min: 0, max: 1000 },
                isSuperhost: false,
                sort: 'date',
            },
            pagination: {
                currentPage: 1,
                itemsPerPage: 6,
                totalPages: 1,
            },
            cart: [],
            selectedEvent: null,
            isCartOpen: false,
            isCheckoutOpen: false,

            setEvents: (events) => {
                set({ events });
                get().applyFilters();
            },

            setSearch: (query) => {
                set({ searchQuery: query });
                get().applyFilters();
            },

            setFilters: (newFilters) => {
                set((state) => ({
                    filters: { ...state.filters, ...newFilters },
                }));
                get().applyFilters();
            },

            setPage: (page) => {
                set((state) => {
                    const { filteredEvents, pagination } = state;
                    const startIndex = (page - 1) * pagination.itemsPerPage;
                    const endIndex = startIndex + pagination.itemsPerPage;
                    return {
                        pagination: { ...pagination, currentPage: page },
                        paginatedEvents: filteredEvents.slice(startIndex, endIndex),
                    };
                });
            },

            addToCart: (event, qty = 1) =>
                set((state) => {
                    const existingItem = state.cart.find((item) => item.id === event.id);
                    if (existingItem) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === event.id ? { ...item, qty: item.qty + qty } : item
                            ),
                            isCartOpen: true,
                        };
                    }
                    return { cart: [...state.cart, { ...event, qty }], isCartOpen: true };
                }),

            removeFromCart: (eventId) =>
                set((state) => ({ cart: state.cart.filter((e) => e.id !== eventId) })),

            updateCartQty: (eventId, qty) =>
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.id === eventId ? { ...item, qty: Math.max(1, qty) } : item
                    ),
                })),

            clearCart: () => set({ cart: [] }),

            applyFilters: () => {
                const { events, searchQuery, filters, pagination } = get();

                let result = [...events];

                // Search Filter
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    result = result.filter(
                        (e) =>
                            e.title.toLowerCase().includes(query) ||
                            e.description.toLowerCase().includes(query) ||
                            e.tags.some((tag) => tag.toLowerCase().includes(query))
                    );
                }

                // Type Filter
                if (filters.type !== 'all') {
                    result = result.filter((e) => e.type === filters.type);
                }

                // Superhost Filter
                if (filters.isSuperhost) {
                    result = result.filter((e) => e.isSuperhost);
                }

                // Price Filter
                result = result.filter(
                    (e) => e.price >= filters.priceRange.min && e.price <= filters.priceRange.max
                );

                // Date Filter
                if (filters.dateRange.start) {
                    result = result.filter((e) => e.date >= filters.dateRange.start!);
                }
                if (filters.dateRange.end) {
                    result = result.filter((e) => e.date <= filters.dateRange.end!);
                }

                // Sorting
                result.sort((a, b) => {
                    if (filters.sort === 'price_asc') return a.price - b.price;
                    if (filters.sort === 'price_desc') return b.price - a.price;
                    // Default to date (newest first)
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                });

                // Pagination Calculation
                const totalPages = Math.ceil(result.length / pagination.itemsPerPage);
                const currentPage = 1; // Reset to first page on filter change
                const startIndex = 0;
                const endIndex = pagination.itemsPerPage;
                const paginatedEvents = result.slice(startIndex, endIndex);

                set({
                    filteredEvents: result,
                    paginatedEvents,
                    pagination: { ...pagination, totalPages, currentPage },
                });
            },

            setSelectedEvent: (event) => set({ selectedEvent: event }),

            toggleCart: (isOpen) =>
                set((state) => ({ isCartOpen: isOpen !== undefined ? isOpen : !state.isCartOpen })),

            toggleCheckout: (isOpen) =>
                set((state) => ({ isCheckoutOpen: isOpen !== undefined ? isOpen : !state.isCheckoutOpen })),
        }),
        {
            name: 'booking-storage',
            partialize: (state) => ({ cart: state.cart }), // Only persist cart
        }
    )
);
