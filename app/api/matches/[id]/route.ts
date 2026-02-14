import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id: matchId } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body; // actions: 'request_friend', 'accept_friend', 'decline_friend', 'part_ways'

        // Verify user is part of the match
        const match = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!match || (match.boyId !== session.user.id && match.girlId !== session.user.id)) {
            return NextResponse.json({ error: 'Match not found or unauthorized' }, { status: 404 });
        }

        if (action === 'part_ways' || action === 'decline_friend') {
            await prisma.match.delete({
                where: { id: matchId },
            });
            return NextResponse.json({ message: 'Connection severed.' });
        }

        if (action === 'request_friend') {
            // Check if partner already requested
            if (match.status.startsWith('friend_request_') && !match.status.endsWith(session.user.id)) {
                // Partner already requested, so this is mutual acceptance
                const updatedMatch = await prisma.match.update({
                    where: { id: matchId },
                    data: { status: 'friend' },
                });
                return NextResponse.json({ match: updatedMatch, message: 'Mutual connection! Added to Sanctuary.' });
            }

            // New individual request
            const updatedMatch = await prisma.match.update({
                where: { id: matchId },
                data: { status: `friend_request_${session.user.id}` },
            });
            return NextResponse.json({ match: updatedMatch, message: 'Vibration sent. Waiting for harmony.' });
        }

        if (action === 'accept_friend') {
            const updatedMatch = await prisma.match.update({
                where: { id: matchId },
                data: { status: 'friend' },
            });
            return NextResponse.json({ match: updatedMatch, message: 'Friendship finalized!' });
        }

        if (action === 'start_task') {
            const updatedMatch = await prisma.match.update({
                where: { id: matchId },
                data: { taskStatus: 'ongoing' },
            });
            return NextResponse.json({ match: updatedMatch, message: 'Vibrational quest begun! ✨' });
        }

        if (action === 'complete_task') {
            const { proofUrl } = body;
            const updatedMatch = await prisma.match.update({
                where: { id: matchId },
                data: {
                    taskStatus: 'completed',
                    taskProofUrl: proofUrl
                },
            });
            return NextResponse.json({ match: updatedMatch, message: 'Harmony achieved! Quest complete. 🌸' });
        }

        if (action === 'assign_task') {
            // Get user with traits to find compatible tasks
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

            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            const allTasks = user.traits.flatMap(ut => ut.trait.tasks);
            const otherTasks = allTasks.filter(t => t.id !== match.taskId);
            const pool = otherTasks.length > 0 ? otherTasks : allTasks;
            const newTask = pool[Math.floor(Math.random() * pool.length)];

            if (!newTask) {
                return NextResponse.json({ error: 'No new tasks found' }, { status: 404 });
            }

            const updatedMatch = await prisma.match.update({
                where: { id: matchId },
                data: {
                    taskId: newTask.id,
                    taskStatus: 'pending',
                    taskProofUrl: null
                },
                include: {
                    task: true
                }
            });

            return NextResponse.json({
                match: updatedMatch,
                message: 'New shared quest assigned! ✨'
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Match action error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
