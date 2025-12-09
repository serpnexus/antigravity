import { Link } from '@/navigation';
import { getPosts } from '@/lib/wordpress';

export default async function BlogListingPage() {
    const posts = await getPosts();

    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Our Blog</h1>
                <p style={{ color: 'var(--foreground-muted)' }}>Latest updates, thoughts, and technical deep dives.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {posts.map((post) => (
                    <article key={post.slug} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '0.5rem 0' }}>
                            {/* Date & Author */}
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {new Date(post.date).toLocaleDateString()} • {post.author.node.name}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3 }}>
                                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                                    {post.title}
                                </Link>
                            </h2>
                            <div dangerouslySetInnerHTML={{ __html: post.excerpt }} style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }} />
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                            <Link href={`/blog/${post.slug}`} className="btn" style={{ background: 'transparent', border: '1px solid var(--card-border)', width: '100%' }}>
                                Read More
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
