import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPage } from '@/lib/wordpress';
import { generateSEOMetadata, JsonLd } from '@/components/seo/SEOHead';
import { generateSchemaByType } from '@/lib/seo';
import WordPressContent from '@/components/content/WordPressContent';

interface PageProps {
    params: Promise<{ locale: string; slug: string[] }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

// Known static routes that should not be handled by this catch-all
const EXCLUDED_ROUTES = ['blog', 'tools', 'api'];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const pageSlug = slug.join('/');

    // Skip excluded routes
    if (EXCLUDED_ROUTES.includes(slug[0])) {
        return {};
    }

    const page = await getPage(pageSlug, locale);

    if (!page) {
        return {
            title: 'Page Not Found',
        };
    }

    return generateSEOMetadata({
        title: page.seo.title || page.title,
        description: page.seo.description || page.description,
        canonical: page.seo.canonical || `${SITE_URL}/${locale}/${pageSlug}`,
        keywords: page.seo.keywords,
        ogImage: page.seo.ogImage || page.featuredImage,
        locale,
    });
}

export default async function DynamicPage({ params }: PageProps) {
    const { locale, slug } = await params;
    const pageSlug = slug.join('/');

    // Skip excluded routes - they have their own handlers
    if (EXCLUDED_ROUTES.includes(slug[0])) {
        notFound();
    }

    const page = await getPage(pageSlug, locale);

    if (!page) {
        notFound();
    }

    // Generate schema based on WordPress settings
    const schema = generateSchemaByType(page.schema.type, {
        title: page.title,
        description: page.description,
        url: `${SITE_URL}/${locale}/${pageSlug}`,
        image: page.featuredImage,
        datePublished: page.modified,
        dateModified: page.modified,
    });

    // Get translation keys for current locale
    const translationKeys = page.translationKeys?.[locale];

    return (
        <>
            {schema && <JsonLd data={schema} />}
            <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
                <article>
                    <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
                            {page.title}
                        </h1>
                        {page.description && (
                            <p style={{ color: 'var(--foreground-muted)', fontSize: '1.25rem' }}>
                                {page.description}
                            </p>
                        )}
                    </header>

                    <div className="prose" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <WordPressContent
                            html={page.content}
                            translationKeys={translationKeys}
                        />
                    </div>
                </article>
            </div>
        </>
    );
}
