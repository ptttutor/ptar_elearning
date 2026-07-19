import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

// GET: /api/admin/categories - list all categories
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const categories = await prisma.category.findMany({
      include: { courses: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: /api/admin/categories - create a new category
export async function POST(req) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const category = await prisma.category.create({
      data: {
        name: body.name,
        description: body.description,
      },
    });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
