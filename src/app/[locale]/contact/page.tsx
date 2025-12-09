'use client';

import { useState } from 'react';
import styles from './contact.module.css';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In production, you would send this to your API
        console.log('Form submitted:', formData);
        setStatus('sent');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <span className={styles.badge}>Contact</span>
                    <h1 className={styles.title}>Get in Touch</h1>
                    <p className={styles.subtitle}>
                        Have a project in mind? We'd love to hear from you.
                    </p>
                </div>

                <div className={styles.grid}>
                    {/* Contact Info */}
                    <div className={styles.info}>
                        <div className={styles.infoCard}>
                            <div className={styles.iconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <div>
                                <h3>Email</h3>
                                <a href="mailto:hello@antigravity.dev">hello@antigravity.dev</a>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.iconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div>
                                <h3>Location</h3>
                                <p>Remote & Worldwide</p>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.iconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <h3>Response Time</h3>
                                <p>Within 24 hours</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Your name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                placeholder="What's this about?"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={5}
                                placeholder="Tell us about your project..."
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn ${styles.submitBtn}`}
                            disabled={status === 'sending'}
                        >
                            {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent!' : 'Send Message'}
                        </button>

                        {status === 'sent' && (
                            <p className={styles.successMsg}>Thank you! We'll get back to you soon.</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
