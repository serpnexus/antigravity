import { Metadata } from 'next';
import config from '@/config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'AntiGravity';

export interface SEOMetadataProps {
    title: string;
    description: string;
    canonical?: string;
    keywords?: string;
    ogImage?: string;
    locale: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    noIndex?: boolean;
}

/**
 * Generate Next.js Metadata object for SEO
 */
export function generateSEOMetadata({
    title,
    description,
    canonical,
    keywords,
    ogImage,
    locale,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    noIndex = false,
}: SEOMetadataProps): Metadata {
    const url = canonical || `${SITE_URL}/${locale}`;
    const image = ogImage || `${SITE_URL}/og-image.png`;

    // Generate alternate language URLs
    const alternates: Metadata['alternates'] = {
        canonical: url,
        languages: config.locales.reduce((acc, lang) => {
            const path = url.replace(`/${locale}`, `/${lang}`);
            acc[lang] = path;
            return acc;
        }, {} as Record<string, string>),
    };

    const metadata: Metadata = {
        title: {
            default: title,
            template: `%s | ${SITE_NAME}`,
        },
        description,
        keywords: keywords?.split(',').map(k => k.trim()),
        authors: author ? [{ name: author }] : undefined,
        alternates,
        openGraph: {
            title,
            description,
            url,
            siteName: SITE_NAME,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale,
            type,
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
        robots: noIndex
            ? { index: false, follow: false }
            : { index: true, follow: true },
    };

    return metadata;
}

/**
 * Generate JSON-LD script for structured data
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
