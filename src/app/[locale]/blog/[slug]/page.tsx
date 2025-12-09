import { getPost } from '@/lib/wordpress';
import { notFound } from 'next/navigation';

export default async function BlogPostPage({
    params
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="container" style={{ paddingTop: '4rem', paddingBottom: '5rem', maxWidth: '800px' }}>
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: 500, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} — {post.author?.node?.name || 'Admin'}
                </div>
                <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem' }}>
                    {post.title}
                </h1>
                <div style={{ width: '80px', height: '4px', background: 'linear-gradient(to right, var(--primary), #818cf8)', margin: '0 auto', borderRadius: '2px' }}></div>
            </header>

            {/* Featured Image */}
            {post.featuredImage?.node?.sourceUrl && (
                <img
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.title}
                    className="featured-image-large"
                    style={{ width: '100%', borderRadius: '1rem', marginBottom: '2rem' }}
                />
            )}

            {/* Post Content with prose styling */}
            <div className="prose" dangerouslySetInnerHTML={{ __html: post.content || '' }} />

            {/* Comments Section */}
            <div style={{ marginTop: '4rem', borderTop: '1px solid var(--card-border)', paddingTop: '3rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Comments</h3>
                <p style={{ color: 'var(--foreground-muted)' }}>Comments functionality coming soon.</p>
            </div>
        </article>
    );
}
