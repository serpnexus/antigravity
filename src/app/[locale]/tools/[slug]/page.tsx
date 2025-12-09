import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getToolContent, getAllTools } from '@/lib/wordpress';
import { generateSEOMetadata, JsonLd } from '@/components/seo/SEOHead';
import { generateToolSchema } from '@/lib/seo';
import WordPressContent from '@/components/content/WordPressContent';

interface ToolPageProps {
    params: Promise<{ locale: string; slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const tool = await getToolContent(slug, locale);

    if (!tool) {
        return {
            title: 'Tool Not Found',
        };
    }

    return generateSEOMetadata({
        title: tool.seo.title || tool.title,
        description: tool.seo.description || tool.description,
        canonical: tool.seo.canonical || `${SITE_URL}/${locale}/tools/${slug}`,
        keywords: tool.seo.keywords,
        ogImage: tool.seo.ogImage || tool.featuredImage,
        locale,
    });
}

// Generate static params for all tools
export async function generateStaticParams() {
    const tools = await getAllTools();
    return tools.map((tool) => ({
        slug: tool.slug,
    }));
}

export default async function ToolDetailPage({ params }: ToolPageProps) {
    const { locale, slug } = await params;
    const tool = await getToolContent(slug, locale);

    if (!tool) {
        notFound();
    }

    // Generate SoftwareApplication schema
    const schema = generateToolSchema({
        name: tool.title,
        description: tool.description,
        url: `${SITE_URL}/${locale}/tools/${slug}`,
        image: tool.featuredImage,
        applicationCategory: 'WebApplication',
    });

    // Get translation keys for current locale
    const translationKeys = tool.translationKeys?.[locale];

    return (
        <>
            <JsonLd data={schema} />
            <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
                <article>
                    <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            color: 'var(--primary)',
                            marginBottom: '1rem'
                        }}>
                            Free Online Tool
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
                            {tool.title}
                        </h1>
                        {tool.description && (
                            <p style={{ color: 'var(--foreground-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
                                {tool.description}
                            </p>
                        )}
                    </header>

                    {/* Tool Interface - This is where the actual tool component would go */}
                    <div className="card" style={{ marginBottom: '3rem', padding: '2rem' }}>
                        <div style={{ textAlign: 'center', color: 'var(--foreground-muted)' }}>
                            <p>Tool interface component goes here</p>
                            <p style={{ fontSize: '0.875rem' }}>
                                Create a specific component for this tool at:<br />
                                <code style={{ background: 'var(--card-bg)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                    src/components/tools/{slug}/ToolInterface.tsx
                                </code>
                            </p>
                        </div>
                    </div>

                    {/* Content from WordPress */}
                    {tool.content && (
                        <div className="prose" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <WordPressContent
                                html={tool.content}
                                translationKeys={translationKeys}
                            />
                        </div>
                    )}
                </article>
            </div>
        </>
    );
}
