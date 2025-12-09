import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Metadata } from 'next';
import "../globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { JsonLd } from '@/components/seo/SEOHead';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'AntiGravity';

export const metadata: Metadata = {
    title: {
        default: SITE_NAME,
        template: `%s | ${SITE_NAME}`,
    },
    description: 'Premium Next.js + WordPress Integration with multi-language support',
    metadataBase: new URL(SITE_URL),
    openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        locale: 'en_US',
        alternateLocale: ['es_ES', 'fr_FR', 'de_DE'],
    },
    twitter: {
        card: 'summary_large_image',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();
    const { locale } = await params;

    return (
        <html lang={locale}>
            <head>
                <JsonLd data={generateOrganizationSchema()} />
                <JsonLd data={generateWebSiteSchema()} />
            </head>
            <body>
                <NextIntlClientProvider messages={messages}>
                    <div className="layout-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <Header />
                        <main style={{ flex: 1, paddingTop: '80px' }}>{children}</main>
                        <Footer />
                    </div>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
