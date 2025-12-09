import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { secret, path } = body;

        // Validate secret token
        const expectedSecret = process.env.REVALIDATION_SECRET;

        if (!expectedSecret) {
            console.warn('[Revalidate] REVALIDATION_SECRET not set in environment');
            return NextResponse.json(
                { revalidated: false, message: 'Server not configured for revalidation' },
                { status: 500 }
            );
        }

        if (secret !== expectedSecret) {
            return NextResponse.json(
                { revalidated: false, message: 'Invalid secret' },
                { status: 401 }
            );
        }

        if (!path) {
            return NextResponse.json(
                { revalidated: false, message: 'Path is required' },
                { status: 400 }
            );
        }

        // Revalidate the specified path
        revalidatePath(path);

        console.log(`[Revalidate] Successfully revalidated path: ${path}`);

        return NextResponse.json({
            revalidated: true,
            path,
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error('[Revalidate] Error:', error);
        return NextResponse.json(
            { revalidated: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Also support GET for simple testing
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get('secret');
    const path = searchParams.get('path');

    if (!secret || !path) {
        return NextResponse.json({
            message: 'Revalidation API is active. Use POST with {secret, path} or GET with ?secret=...&path=...',
            status: 'ok'
        });
    }

    // Forward to POST handler logic
    const expectedSecret = process.env.REVALIDATION_SECRET;

    if (secret !== expectedSecret) {
        return NextResponse.json({ revalidated: false, message: 'Invalid secret' }, { status: 401 });
    }

    revalidatePath(path);

    return NextResponse.json({
        revalidated: true,
        path,
        timestamp: Date.now(),
    });
}
