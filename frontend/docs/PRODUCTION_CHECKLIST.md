# Production Checklist

Before deploying to production, verify the following items:

## 1. Configuration
- [ ] **Environment Variables**: Set `NEXT_PUBLIC_API_URL` to your production backend.
- [ ] **SEO**: Verify `robots.txt` and `sitemap.xml` are generated correctly.
- [ ] **Metadata**: Ensure `app/layout.tsx` has the correct production URL in `metadataBase`.

## 2. Assets & Content
- [ ] **Images**: Ensure all placeholder images are replaced with licensed or real assets.
- [ ] **Favicon**: Verify the favicon matches the brand.
- [ ] **3D Scenes**: Check loading performance of Spline scenes on mobile networks.

## 3. Functionality
- [ ] **Forms**: Verify the Contact form submits to a real endpoint (or email service).
- [ ] **Booking Flow**: Test the booking flow with a real payment gateway (in test mode).
- [ ] **Error Handling**: Ensure 404 and 500 pages are styled and helpful.

## 4. Performance
- [ ] **Lighthouse Score**: Run a Lighthouse audit and optimize for Core Web Vitals.
- [ ] **Caching**: Verify static pages are cached correctly by Vercel.

## 5. Legal
- [ ] **Privacy Policy**: Update `src/app/privacy/page.tsx` with real legal text.
- [ ] **Terms of Service**: Update `src/app/terms/page.tsx` with real legal text.
