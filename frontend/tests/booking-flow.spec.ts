import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
    test('should allow a user to search, filter, and book an event', async ({ page }) => {
        // 1. Navigate to booking page
        await page.goto('/booking');
        await expect(page).toHaveTitle(/SwitchUp/);

        // 2. Search for an event
        const searchInput = page.getByPlaceholder('Search events, hosts, or tags...');
        await searchInput.fill('Party');
        // Wait for debounce or filtering
        await page.waitForTimeout(500);

        // 3. Click on the first event card to open details
        const firstEventCard = page.locator('article').first();
        await firstEventCard.click();

        // 4. Verify modal opens
        const modal = page.getByRole('dialog', { name: /modal/i }).first(); // Adjust selector based on aria-label or role
        // Since we added aria-labelledby="modal-title" to EventDetailsModal
        await expect(page.locator('[role="dialog"][aria-labelledby="modal-title"]')).toBeVisible();

        // 5. Add to cart
        const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
        await addToCartButton.click();

        // 6. Verify cart drawer opens
        const cartDrawer = page.locator('[role="dialog"][aria-labelledby="cart-title"]');
        await expect(cartDrawer).toBeVisible();
        await expect(page.getByText('Your Cart')).toBeVisible();

        // 7. Proceed to checkout
        const checkoutButton = page.getByRole('button', { name: 'Checkout' });
        await checkoutButton.click();

        // 8. Verify checkout modal opens
        const checkoutModal = page.locator('[role="dialog"][aria-labelledby="checkout-title"]');
        await expect(checkoutModal).toBeVisible();

        // 9. Fill checkout form
        await page.getByLabel('Full Name').fill('John Doe');
        await page.getByLabel('Email Address').fill('john@example.com');
        await page.getByLabel('Phone Number').fill('1234567890');

        // Select payment method (assuming Credit Card is default or selectable)
        // await page.getByLabel('Credit Card').check(); 

        // 10. Submit order
        const placeOrderButton = page.getByRole('button', { name: 'Place Order' });
        await placeOrderButton.click();

        // 11. Verify success
        await expect(page.getByText('Order Confirmed')).toBeVisible();
        await expect(page.getByText('Thank you for your purchase!')).toBeVisible();
    });
});
