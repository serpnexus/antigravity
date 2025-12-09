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
                <div style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: 500 }}>
                    {new Date(post.date).toLocaleDateString()} — {post.author.node.name}
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '2rem' }}>
                    {post.title}
                </h1>
                <div style={{ width: '100px', height: '4px', background: 'var(--primary)', margin: '0 auto', opacity: 0.5 }}></div>
            </header>

            <div className="prose" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#d4d4d8' }} dangerouslySetInnerHTML={{ __html: post.content || '' }} />

            {/* Comments Section Placeholder */}
            <div style={{ marginTop: '5rem', borderTop: '1px solid var(--card-border)', paddingTop: '3rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Comments</h3>
                <p style={{ color: 'var(--foreground-muted)' }}>Comments functionality coming soon.</p>
            </div>
        </article>
    );
}
