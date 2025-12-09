import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    locales: ['en', 'es', 'fr', 'de'],
    defaultLocale: 'en'
});

export default function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Blog routes are English-only - redirect other locales to English
    const blogRegex = /^\/(es|fr|de)\/blog(\/.*)?$/;
    const match = pathname.match(blogRegex);

    if (match) {
        const blogPath = match[2] || '';
        const englishUrl = new URL(`/en/blog${blogPath}`, request.url);
        return NextResponse.redirect(englishUrl);
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: ['/', '/(de|en|fr|es)/:path*']
};
