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
        startDate: `${event.date}T${event.time}`, // Assuming date is YYYY-MM-DD and time is HH:MM
        endDate: `${event.date}T23:59`, // Placeholder end time
        location: {
            '@type': 'Place',
            name: event.venue,
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'City Name', // Needs to be dynamic if available
                addressCountry: 'US',
            },
        },
        image: [event.image],
        organizer: {
            '@type': 'Person',
            name: 'Host Name', // Should fetch host name if available
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
