import { useBookingStore } from '../bookingStore';

// Mock persist middleware to avoid storage issues in test environment
jest.mock('zustand/middleware', () => ({
    persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
}));

describe('bookingStore', () => {
    beforeEach(() => {
        useBookingStore.setState({
            cart: [],
            events: [],
            filteredEvents: [],
            filters: {
                type: 'all',
                priceRange: { min: 0, max: 1000 },
                date: null,
                isSuperhost: false,
            },
            searchQuery: '',
            isCartOpen: false,
            isCheckoutOpen: false,
            selectedEvent: null,
        });
    });

    it('should add item to cart', () => {
        const event = { id: '1', title: 'Test Event', price: 100 } as any;
        useBookingStore.getState().addToCart(event, 2);

        const { cart } = useBookingStore.getState();
        expect(cart).toHaveLength(1);
        expect(cart[0]).toEqual({ ...event, qty: 2 });
    });

    it('should update cart quantity', () => {
        const event = { id: '1', title: 'Test Event', price: 100 } as any;
        useBookingStore.getState().addToCart(event, 1);
        useBookingStore.getState().updateCartQty('1', 5);

        const { cart } = useBookingStore.getState();
        expect(cart[0].qty).toBe(5);
    });

    it('should remove item from cart', () => {
        const event = { id: '1', title: 'Test Event', price: 100 } as any;
        useBookingStore.getState().addToCart(event, 1);
        useBookingStore.getState().removeFromCart('1');

        const { cart } = useBookingStore.getState();
        expect(cart).toHaveLength(0);
    });

    it('should set filters', () => {
        useBookingStore.getState().setFilters({ isSuperhost: true });
        expect(useBookingStore.getState().filters.isSuperhost).toBe(true);
    });
});
