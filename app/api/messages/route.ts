import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { content, matchId } = await req.json();

        if (!content || !matchId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify user is part of the match
        const match = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!match || (match.boyId !== session.user.id && match.girlId !== session.user.id)) {
            return NextResponse.json({ error: 'Unauthorized for this match' }, { status: 401 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                senderId: session.user.id,
                matchId,
            },
            include: {
                sender: {
                    select: { name: true },
                },
            },
        });

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Chat Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');

    if (!session?.user || !matchId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Verify user is part of the match
        const match = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!match || (match.boyId !== session.user.id && match.girlId !== session.user.id)) {
            return NextResponse.json({ error: 'Unauthorized for this match' }, { status: 401 });
        }

        const messages = await prisma.message.findMany({
            where: { matchId },
            include: {
                sender: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json({ messages });
    } catch (_error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
