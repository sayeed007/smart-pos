
import { NextResponse } from 'next/server';
import { MOCK_CUSTOMERS } from '@/lib/mock-data';
import { Customer } from '@/types';

let customers: Customer[] = [...MOCK_CUSTOMERS];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (search) {
        const q = search.toLowerCase();
        const filtered = customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
        return NextResponse.json(filtered);
    }
    return NextResponse.json(customers);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newCustomer: Customer = {
            ...body,
            id: "c" + Math.random().toString(36).substring(7),
            totalSpent: 0,
            loyaltyPoints: 0,
            history: []
        };
        customers.push(newCustomer);
        return NextResponse.json(newCustomer, { status: 201 });
    } catch (e) {
        return NextResponse.json({ message: 'Invalid Data' }, { status: 400 });
    }
}
