// JSON.stringify doesn't escape `<`, so a host-supplied event title/description
// containing `</script>` would close the JSON-LD script tag early and let
// arbitrary markup execute. `<` round-trips to the same `<` once a JSON-LD
// parser (or JSON.parse) reads it back, so this only affects the raw HTML.
export const safeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');

export const generateOrganizationSchema = () => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'UpSosh',
        url: 'https://upsosh.vercel.app',
        logo: 'https://upsosh.vercel.app/logo.png',
        sameAs: [
            'https://twitter.com/upsosh',
            'https://www.instagram.com/upsosh.app/',
            'https://linkedin.com/company/upsosh'
        ],
        description: 'Discover formal + informal events around you — all in one place.',
    };
};

export const generateEventSchema = (event: any) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.description,
        startDate: `${event.date}T${event.time}`, 
        endDate: `${event.date}T23:59`, 
        location: {
            '@type': 'Place',
            name: event.venue,
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'City Name', 
                addressCountry: 'US',
            },
        },
        image: [event.image],
        organizer: {
            '@type': 'Person',
            name: 'Host Name', 
        },
        offers: {
            '@type': 'Offer',
            price: event.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: `https://upsosh.vercel.app/booking/${event.id}`,
        },
    };
};
