import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const traits = await prisma.personalityTrait.findMany({
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json({ traits });
    } catch (error) {
        console.error('Traits fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch traits' }, { status: 500 });
    }
}
