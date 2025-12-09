import { useTranslations } from 'next-intl';

export default function ToolsPage() {
    const t = useTranslations('HomePage'); // Using HomePage for now or create new messages

    return (
        <div className="container" style={{ paddingTop: '4rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Dev Tools</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Example Tool Card */}
                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>JSON Formatter</h3>
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Prettify and minify your JSON data instantly.</p>
                    <button className="btn" style={{ width: '100%', padding: '0.5rem' }}>Open Tool</button>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>CSS Minifier</h3>
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Optimize your CSS for production.</p>
                    <button className="btn" style={{ width: '100%', padding: '0.5rem' }}>Open Tool</button>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Slug Generator</h3>
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Convert text into URL-friendly slugs.</p>
                    <button className="btn" style={{ width: '100%', padding: '0.5rem' }}>Open Tool</button>
                </div>
            </div>
        </div>
    );
}
