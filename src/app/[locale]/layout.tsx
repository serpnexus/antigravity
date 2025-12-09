import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
