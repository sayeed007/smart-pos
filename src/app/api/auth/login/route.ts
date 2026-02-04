
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, role } = body;

        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock validation
        if (!email || !role) {
            return NextResponse.json(
                { message: 'Email and Role are required' },
                { status: 400 }
            );
        }

        const mockUser = {
            id: "u-" + Math.random().toString(36).substring(7),
            name: email.split("@")[0] || "User",
            email,
            role,
            status: "active",
        };

        // Return token + user (In real app, return JWT)
        return NextResponse.json({
            token: "mock-jwt-token",
            user: mockUser
        });

    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
