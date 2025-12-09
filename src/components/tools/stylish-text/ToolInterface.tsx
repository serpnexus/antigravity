'use client';


import { useState, useMemo, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { TEXT_STYLES } from './text-maps';
import styles from './ToolInterface.module.css';

export default function StylishTextTool() {
    const [input, setInput] = useState('AntiGravity');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSticky, setIsSticky] = useState(false);

    // Categories extraction
    const categories = useMemo(() => {
        const cats = new Set(TEXT_STYLES.map(s => s.category));
        return ['All', ...Array.from(cats)];
    }, []);

    // Filter styles
    const filteredStyles = useMemo(() => {
        return TEXT_STYLES.filter(style => {
            const matchesCategory = activeCategory === 'All' || style.category === activeCategory;
            const matchesSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [input, activeCategory, searchQuery]);

    // Scroll listener for sticky header
    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 200);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const copyToClipboard = async (text: string, styleName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard!', {
                description: `${styleName} style`,
                duration: 2000,
                style: { background: 'var(--card-bg)', color: 'var(--foreground)', border: '1px solid var(--primary)' }
            });
        } catch (err) {
            console.error('Failed to copy', err);
            toast.error('Failed to copy');
        }
    };

    return (
        <div className={styles.container}>
            <Toaster position="bottom-center" />

            {/* Sticky Header Area */}
            <div className={`${styles.stickyHeader} ${isSticky ? styles.isSticky : ''} `}>
                <div className={styles.headerContent}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className={styles.input}
                            placeholder="Type your text here..."
                        />
                        <div className={styles.charCount}>
                            {input.length} chars
                        </div>
                    </div>

                    <div className={styles.controls}>
                        {/* Category Pills */}
                        <div className={styles.categories}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : styles.inactive} `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className={styles.searchWrapper}>
                            <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search styles..."
                                className={styles.searchInput}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className={styles.grid}>
                {filteredStyles.map((style, index) => {
                    const transformed = style.transform ? style.transform(input) : input;

                    return (
                        <div
                            key={`${style.name} -${index} `}
                            className={styles.card}
                            onClick={() => copyToClipboard(transformed, style.name)}
                        >
                            <div className={styles.cardContent}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.styleName}>
                                        {style.name}
                                    </span>
                                    <span className={styles.copyBadge}>
                                        Copy
                                    </span>
                                </div>

                                <div className={styles.previewText}>
                                    {transformed}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredStyles.length === 0 && (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🔍</span>
                    <h3 className={styles.emptyTitle}>No styles found</h3>
                    <p className={styles.emptyDesc}>Try adjusting your search or category filter.</p>
                </div>
            )}
        </div>
    );

}

