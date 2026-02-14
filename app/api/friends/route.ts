import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const friends = await prisma.match.findMany({
            where: {
                OR: [
                    { boyId: session.user.id },
                    { girlId: session.user.id },
                ],
                status: 'friend',
            },
            include: {
                boy: {
                    select: { id: true, name: true, age: true },
                },
                girl: {
                    select: { id: true, name: true, age: true },
                },
                task: true,
            },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json({ friends });
    } catch (error) {
        console.error('Friends fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
