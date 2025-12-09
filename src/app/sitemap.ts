import { MetadataRoute } from 'next';
import { getSitemapData } from '@/lib/wordpress';
import config from '@/config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const data = await getSitemapData();
    const entries: MetadataRoute.Sitemap = [];

    // Add homepage for each locale
    for (const locale of config.locales) {
        entries.push({
            url: `${SITE_URL}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        });
    }

    // Add managed pages
    for (const page of data.pages) {
        const locales = page.locales || config.locales;
        for (const locale of locales) {
            entries.push({
                url: `${SITE_URL}/${locale}/${page.slug}`,
                lastModified: new Date(page.modified),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        }
    }

    // Add tools
    for (const tool of data.tools) {
        const locales = tool.locales || config.locales;
        for (const locale of locales) {
            entries.push({
                url: `${SITE_URL}/${locale}/tools/${tool.slug}`,
                lastModified: new Date(tool.modified),
                changeFrequency: 'weekly',
                priority: 0.9,
            });
        }
    }

    // Add blog posts (English only based on your requirements)
    for (const post of data.posts) {
        entries.push({
            url: `${SITE_URL}/en/blog/${post.slug}`,
            lastModified: new Date(post.modified),
            changeFrequency: 'monthly',
            priority: 0.7,
        });
    }

    // Add tools listing page
    for (const locale of config.locales) {
        entries.push({
            url: `${SITE_URL}/${locale}/tools`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        });
    }

    // Add blog listing page
    entries.push({
        url: `${SITE_URL}/en/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
    });

    return entries;
}
