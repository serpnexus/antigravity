'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface WordPressContentProps {
    html: string;
    translationKeys?: {
        [key: string]: {
            tag: string;
            content: string;
        };
    };
    namespace?: string;
    className?: string;
}

/**
 * Renders WordPress content with automatic translation key replacement
 * 
 * When WordPress content contains text like "This is Heading H2",
 * and translationKeys contains { "this-is-heading-h2": { tag: "h2", content: "..." } },
 * this component will try to use the translation for the current locale.
 */
export default function WordPressContent({
    html,
    translationKeys,
    namespace = 'Content',
    className = '',
}: WordPressContentProps) {
    const t = useTranslations(namespace);

    const processedHtml = useMemo(() => {
        if (!translationKeys || Object.keys(translationKeys).length === 0) {
            return html;
        }

        let processed = html;

        // Replace translatable content with translations
        for (const [key, value] of Object.entries(translationKeys)) {
            try {
                // Try to get translation
                const translation = t(key);
                if (translation && translation !== key) {
                    // Replace the original content with the translation
                    const escapedContent = value.content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(escapedContent, 'gi');
                    processed = processed.replace(regex, translation);
                }
            } catch {
                // Translation key doesn't exist, keep original
            }
        }

        return processed;
    }, [html, translationKeys, t]);

    return (
        <div
            className={`wordpress-content ${className}`}
            dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
    );
}

/**
 * Generate translation key from text
 * "This is Heading H2" -> "this-is-heading-h2"
 */
export function textToKey(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);
}
