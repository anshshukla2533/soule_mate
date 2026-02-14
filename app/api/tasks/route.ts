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

        // Get user's traits
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                traits: {
                    include: {
                        trait: {
                            include: {
                                tasks: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get all tasks related to user's traits
        const recommendedTasks = user.traits.flatMap((userTrait) => userTrait.trait.tasks);

        return NextResponse.json({ tasks: recommendedTasks });
    } catch (error) {
        console.error('Tasks fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}
