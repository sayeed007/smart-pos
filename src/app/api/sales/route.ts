
import { NextResponse } from 'next/server';
import { MOCK_SALES } from '@/lib/mock-data';
import { Sale } from '@/types';

let sales: Sale[] = [...MOCK_SALES];

export async function GET() {
    return NextResponse.json(sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newSale: Sale = {
            ...body,
            id: Math.random().toString(36).substring(7),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        sales.unshift(newSale); // Add to top
        return NextResponse.json(newSale, { status: 201 });
    } catch (e) {
        return NextResponse.json({ message: 'Invalid Data' }, { status: 400 });
    }
}
