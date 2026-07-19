import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/requireUser';


// GET: /api/orders/[id] - get single order (owner or admin only)
export async function GET(req, { params }) {
  try {
    const session = await requireUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: true,
        ebook: true,
        payment: true,
        shipping: true,
        items: true // คืน OrderItem ทั้งหมดใน order
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบคำสั่งซื้อ' },
        { status: 404 }
      );
    }

    if (order.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ' },
      { status: 500 }
    );
  }
}