import { getPostsByAuthor } from '@/lib/wordpress';
import { Link } from '@/navigation';

export default async function AuthorPage({
    params
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const posts = await getPostsByAuthor(slug);

    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <div style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Author</div>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, textTransform: 'capitalize' }}>{slug.replace('-', ' ')}</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {posts.map((post) => (
                    <article key={post.slug} className="card">
                        <div style={{ padding: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                                    {post.title}
                                </Link>
                            </h2>
                            <div dangerouslySetInnerHTML={{ __html: post.excerpt }} style={{ color: 'var(--foreground-muted)' }} />
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
