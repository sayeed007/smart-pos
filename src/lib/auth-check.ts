
import { NextRequest } from 'next/server';
import { UserRole } from '@/types';
import { MOCK_USERS } from '@/lib/mock-data';

export function getAuthenticatedUser(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null; // No token
    }

    const token = authHeader.split(' ')[1];
    // Mock token format: "mock-token-{userId}"
    if (!token.startsWith('mock-token-')) {
        return null;
    }

    const userId = token.replace('mock-token-', '');
    const user = MOCK_USERS.find(u => u.id === userId);
    return user || null;
}

export function enforceRole(req: Request, allowedRoles: UserRole[]) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return { authorized: false, status: 401, message: 'Unauthorized' };
    }
    if (!allowedRoles.includes(user.role)) {
        return { authorized: false, status: 403, message: 'Forbidden: Insufficient Permissions' };
    }
    return { authorized: true, user };
}
