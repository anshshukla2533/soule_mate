import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                traits: {
                    include: {
                        trait: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { password: _password, ...userWithoutPassword } = user;

        return NextResponse.json({ user: userWithoutPassword });
    } catch (_error) {
        console.error('Profile fetch error:', _error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { traitIds } = await request.json();

        if (!Array.isArray(traitIds)) {
            return NextResponse.json({ error: 'traitIds must be an array' }, { status: 400 });
        }

        // Delete existing traits
        await prisma.userTrait.deleteMany({
            where: { userId: session.user.id },
        });

        // Add new traits
        await prisma.userTrait.createMany({
            data: traitIds.map((traitId: string) => ({
                userId: session.user.id,
                traitId,
            })),
        });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                traits: {
                    include: {
                        trait: true,
                    },
                },
            },
        });

        return NextResponse.json({ user, message: 'Profile updated successfully' });
    } catch (_error) {
        console.error('Profile update error:', _error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
