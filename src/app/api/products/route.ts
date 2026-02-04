
import { NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { Product } from '@/types';

// In-memory store for dev session (will reset on restart)
let products: Product[] = [...MOCK_PRODUCTS];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    let filtered = products;

    if (categoryId && categoryId !== 'all') {
        filtered = filtered.filter(p => p.categoryId === categoryId);
    }

    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.barcode.toLowerCase().includes(q)
        );
    }

    return NextResponse.json(filtered);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newProduct: Product = {
            ...body,
            id: Math.random().toString(36).substring(7),
            stockQuantity: Number(body.stockQuantity) || 0,
            costPrice: Number(body.costPrice) || 0,
            sellingPrice: Number(body.sellingPrice) || 0,
        };
        products.push(newProduct);
        return NextResponse.json(newProduct, { status: 201 });
    } catch (e) {
        return NextResponse.json({ message: 'Invalid Data' }, { status: 400 });
    }
}
