/**
 * SEO Utilities for generating meta tags and structured data schemas
 */

import config from '@/config';

// ============================================
// Types
// ============================================

export interface MetaTagsConfig {
    title: string;
    description: string;
    canonical?: string;
    keywords?: string;
    ogImage?: string;
    locale: string;
    alternateLocales?: string[];
    siteName?: string;
    type?: 'website' | 'article' | 'product';
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
}

export interface SchemaData {
    type: string;
    data: Record<string, unknown>;
}

// ============================================
// Schema Generators
// ============================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'AntiGravity';

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [
            // Add social media links here
        ],
    };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    };
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(config: {
    title: string;
    description: string;
    url: string;
    datePublished?: string;
    dateModified?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: config.title,
        description: config.description,
        url: config.url,
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
        },
        ...(config.datePublished && { datePublished: config.datePublished }),
        ...(config.dateModified && { dateModified: config.dateModified }),
    };
}

/**
 * Generate Article/BlogPosting schema
 */
export function generateArticleSchema(config: {
    title: string;
    description: string;
    url: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    author: string;
    type?: 'Article' | 'BlogPosting' | 'NewsArticle';
}) {
    return {
        '@context': 'https://schema.org',
        '@type': config.type || 'Article',
        headline: config.title,
        description: config.description,
        url: config.url,
        image: config.image,
        datePublished: config.datePublished,
        dateModified: config.dateModified || config.datePublished,
        author: {
            '@type': 'Person',
            name: config.author,
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': config.url,
        },
    };
}

/**
 * Generate SoftwareApplication schema (for tools)
 */
export function generateToolSchema(config: {
    name: string;
    description: string;
    url: string;
    image?: string;
    applicationCategory?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: config.name,
        description: config.description,
        url: config.url,
        image: config.image,
        applicationCategory: config.applicationCategory || 'WebApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
    };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
    items: { name: string; url: string }[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

// ============================================
// Schema Selector (based on WordPress config)
// ============================================

export function generateSchemaByType(
    type: string,
    data: Record<string, unknown>
): Record<string, unknown> | null {
    switch (type) {
        case 'Article':
        case 'BlogPosting':
        case 'NewsArticle':
            return generateArticleSchema({
                title: data.title as string,
                description: data.description as string,
                url: data.url as string,
                image: data.image as string,
                datePublished: data.datePublished as string,
                dateModified: data.dateModified as string,
                author: data.author as string,
                type: type as 'Article' | 'BlogPosting' | 'NewsArticle',
            });

        case 'SoftwareApplication':
            return generateToolSchema({
                name: data.title as string,
                description: data.description as string,
                url: data.url as string,
                image: data.image as string,
                applicationCategory: data.category as string,
            });

        case 'WebPage':
            return generateWebPageSchema({
                title: data.title as string,
                description: data.description as string,
                url: data.url as string,
                datePublished: data.datePublished as string,
                dateModified: data.dateModified as string,
            });

        case 'Organization':
            return generateOrganizationSchema();

        case 'FAQPage':
            return generateFAQSchema(data.faqs as { question: string; answer: string }[]);

        default:
            return generateWebPageSchema({
                title: data.title as string,
                description: data.description as string,
                url: data.url as string,
            });
    }
}

// ============================================
// Meta Tag Helpers
// ============================================

/**
 * Generate canonical URL with locale
 */
export function generateCanonicalUrl(path: string, locale: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SITE_URL}/${locale}${cleanPath}`;
}

/**
 * Generate alternate language URLs for hreflang
 */
export function generateAlternateUrls(
    path: string,
    locales: string[] = config.locales
): { locale: string; url: string }[] {
    return locales.map((locale) => ({
        locale,
        url: generateCanonicalUrl(path, locale),
    }));
}

/**
 * Truncate text for meta descriptions
 */
export function truncateForMeta(text: string, maxLength: number = 160): string {
    const stripped = text.replace(/<[^>]*>/g, '').trim();
    if (stripped.length <= maxLength) return stripped;
    return stripped.slice(0, maxLength - 3).trim() + '...';
}

/**
 * Strip HTML and limit excerpt length
 */
export function truncateExcerpt(excerpt: string, maxLength: number = 120): string {
    const stripped = excerpt.replace(/<[^>]*>/g, '').trim();
    if (stripped.length <= maxLength) return stripped;
    return stripped.slice(0, maxLength).trim() + '...';
}
