import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Matching algorithm: finds compatible opposite-gender user based on shared traits
async function findCompatibleMatch(userId: string, userGender: string, userTraitIds: string[]) {
    if (!userGender || (userGender !== 'boy' && userGender !== 'girl')) {
        return null;
    }

    const oppositeGender = userGender === 'boy' ? 'girl' : 'boy';

    // Find users of opposite gender who aren't currently matched
    const candidates = await prisma.user.findMany({
        where: {
            gender: oppositeGender,
            id: { not: userId },
            NOT: {
                OR: [
                    { matchesAsBoy: { some: { OR: [{ status: { in: ['pending', 'active'] } }, { status: { startsWith: 'friend_request_' } }] } } },
                    { matchesAsGirl: { some: { OR: [{ status: { in: ['pending', 'active'] } }, { status: { startsWith: 'friend_request_' } }] } } },
                ],
            },
        },
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

    // Calculate compatibility scores
    const scoredCandidates = candidates.map((candidate) => {
        const candidateTraitIds = candidate.traits.map((ut) => ut.traitId);
        const sharedTraits = userTraitIds.filter((id) => candidateTraitIds.includes(id));
        const score = sharedTraits.length;

        return {
            candidate,
            score,
            sharedTraits,
        };
    });

    // Sort by compatibility score (highest first)
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Return best match with shared traits
    if (scoredCandidates.length > 0 && scoredCandidates[0].score > 0) {
        return scoredCandidates[0];
    }

    return null;
}

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user already has an active match
        const existingMatch = await prisma.match.findFirst({
            where: {
                OR: [
                    { boyId: session.user.id, OR: [{ status: { in: ['pending', 'active'] } }, { status: { startsWith: 'friend_request_' } }] },
                    { girlId: session.user.id, OR: [{ status: { in: ['pending', 'active'] } }, { status: { startsWith: 'friend_request_' } }] },
                ],
            },
        });

        if (existingMatch) {
            return NextResponse.json(
                { error: 'You already have an active match' },
                { status: 409 }
            );
        }

        // Get current user with traits
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                traits: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.traits.length === 0) {
            return NextResponse.json(
                { error: 'Please select personality traits first' },
                { status: 400 }
            );
        }

        const userTraitIds = user.traits.map((ut) => ut.traitId);

        if (!user.gender || (user.gender !== 'boy' && user.gender !== 'girl')) {
            return NextResponse.json(
                { error: 'Please update your gender in profile' },
                { status: 400 }
            );
        }

        // Find compatible match
        const matchResult = await findCompatibleMatch(session.user.id, user.gender, userTraitIds);

        if (!matchResult) {
            return NextResponse.json(
                { error: 'No compatible matches found. Try again later!' },
                { status: 404 }
            );
        }

        const { candidate, sharedTraits } = matchResult;

        // Get a task from shared traits
        const tasksFromSharedTraits = candidate.traits
            .filter((ut) => sharedTraits.includes(ut.traitId))
            .flatMap((ut) => ut.trait.tasks);

        const selectedTask = tasksFromSharedTraits[Math.floor(Math.random() * tasksFromSharedTraits.length)];

        // Create match
        const match = await prisma.match.create({
            data: {
                boyId: user.gender === 'boy' ? user.id : candidate.id,
                girlId: user.gender === 'girl' ? user.id : candidate.id,
                taskId: selectedTask.id,
                status: 'active',
            },
            include: {
                boy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        age: true,
                    },
                },
                girl: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        age: true,
                    },
                },
                task: true,
            },
        });

        return NextResponse.json({
            match,
            message: 'Match created successfully!',
        }, { status: 201 });
    } catch (error) {
        console.error('Match creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create match' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const match = await prisma.match.findFirst({
            where: {
                AND: [
                    {
                        OR: [
                            { boyId: session.user.id },
                            { girlId: session.user.id },
                        ],
                    },
                    {
                        OR: [
                            { status: { in: ['pending', 'active'] } },
                            { status: { startsWith: 'friend_request_' } },
                            {
                                AND: [
                                    { status: 'friend' },
                                    { taskStatus: { not: 'completed' } }
                                ]
                            }
                        ],
                    }
                ]
            },
            include: {
                boy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        age: true,
                    },
                },
                girl: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        age: true,
                    },
                },
                task: true,
            },
        });

        if (!match) {
            return NextResponse.json({ match: null }, { status: 200 });
        }

        return NextResponse.json({ match });
    } catch (error) {
        console.error('Match fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 });
    }
}
