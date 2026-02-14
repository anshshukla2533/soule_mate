import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, gender, age } = await request.json();

        // Validation
        if (!name || !email || !password || !gender || !age) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (gender !== 'boy' && gender !== 'girl') {
            return NextResponse.json(
                { error: 'Gender must be either "boy" or "girl"' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                gender,
                age: parseInt(age),
            },
            select: {
                id: true,
                name: true,
                email: true,
                gender: true,
                age: true,
            },
        });

        return NextResponse.json({
            user,
            message: 'User registered successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register user' },
            { status: 500 }
        );
    }
}
