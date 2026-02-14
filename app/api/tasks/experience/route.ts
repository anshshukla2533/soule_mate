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
        const { content, proofUrl, matchId } = await req.json();

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

        const experience = await prisma.taskExperience.create({
            data: {
                content,
                proofUrl,
                userId: session.user.id,
                matchId,
            },
        });

        return NextResponse.json({ experience });
    } catch (error) {
        console.error('Task Experience Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const experiences = await prisma.taskExperience.findMany({
            where: matchId ? { matchId } : { userId: session.user.id },
            include: {
                user: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ experiences });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
