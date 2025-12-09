import styles from './privacy.module.css';

export default function PrivacyPage() {
    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1>Privacy Policy</h1>
                    <p className={styles.updated}>Last updated: December 2024</p>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you create an account,
                            contact us, or fill out a form. This may include:
                        </p>
                        <ul>
                            <li>Name and email address</li>
                            <li>Company name</li>
                            <li>Messages and feedback you send us</li>
                            <li>Any other information you choose to provide</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul>
                            <li>Provide, maintain, and improve our services</li>
                            <li>Respond to your comments, questions, and requests</li>
                            <li>Send you technical notices and support messages</li>
                            <li>Communicate with you about products, services, and events</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>3. Information Sharing</h2>
                        <p>
                            We do not sell, trade, or otherwise transfer your personal information to outside parties
                            except as described in this privacy policy. We may share your information with trusted
                            third parties who assist us in operating our website and conducting our business,
                            so long as those parties agree to keep this information confidential.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Data Security</h2>
                        <p>
                            We implement appropriate security measures to protect your personal information.
                            However, no method of transmission over the Internet or electronic storage is 100% secure,
                            and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Cookies</h2>
                        <p>
                            We use cookies and similar tracking technologies to track activity on our website and
                            hold certain information. You can instruct your browser to refuse all cookies or to
                            indicate when a cookie is being sent.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>6. Your Rights</h2>
                        <p>
                            You have the right to access, update, or delete your personal information.
                            If you wish to exercise these rights, please contact us at the email address below.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <p className={styles.contactEmail}>
                            <a href="mailto:privacy@antigravity.dev">privacy@antigravity.dev</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
