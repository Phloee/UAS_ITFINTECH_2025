import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
    id: string;
    email?: string;
    isAdmin: boolean;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
        return decoded;
    } catch (error) {
        return null;
    }
}

export function requireAuth(request: NextRequest): AuthUser {
    const user = getAuthUser(request);
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user;
}

export function requireAdmin(request: NextRequest): AuthUser {
    const user = requireAuth(request);
    if (!user.isAdmin) {
        throw new Error('Admin access required');
    }
    return user;
}

export function unauthorizedResponse(message = 'Unauthorized') {
    return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
    return NextResponse.json({ error: message }, { status: 403 });
}
