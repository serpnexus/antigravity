import styles from './about.module.css';

export default function AboutPage() {
    return (
        <div className={styles.page}>
            <div className="container">
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <span className={styles.badge}>About Us</span>
                        <h1 className={styles.title}>
                            We Build <span className={styles.gradient}>Next-Gen</span> Digital Experiences
                        </h1>
                        <p className={styles.subtitle}>
                            A passionate team of developers and designers creating innovative web solutions
                            with cutting-edge technology.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className={styles.section}>
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <h3>Our Mission</h3>
                            <p>To empower businesses with fast, scalable, and beautiful web experiences using modern technologies.</p>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                            </div>
                            <h3>Our Vision</h3>
                            <p>A world where every business has access to enterprise-grade web technology, regardless of size.</p>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3>Our Values</h3>
                            <p>Innovation, transparency, and putting our clients first in everything we do.</p>
                        </div>
                    </div>
                </section>

                {/* Tech Stack Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Our Tech Stack</h2>
                    <div className={styles.techGrid}>
                        {['Next.js', 'React', 'TypeScript', 'WordPress', 'GraphQL', 'Node.js'].map((tech) => (
                            <div key={tech} className={styles.techItem}>
                                {tech}
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className={styles.cta}>
                    <h2>Ready to Build Something Amazing?</h2>
                    <p>Let's discuss your project and bring your ideas to life.</p>
                    <a href="/contact" className="btn">Get in Touch</a>
                </section>
            </div>
        </div>
    );
}
