import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://upsosh.vercel.app',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: 'https://upsosh.vercel.app/booking',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        
    ];
}
