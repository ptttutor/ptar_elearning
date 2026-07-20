import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { hasMockExamAccess } from "@/lib/mockExamEngine";

// GET: /api/mock-exams/[id]/access - whether the logged-in user may start a
// REAL-mode attempt on this exam (price/purchase gate). PRACTICE mode is
// never gated by this.
export async function GET(request, { params }) {
  try {
    const session = requireUser(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const { id } = await params;
    const exam = await prisma.mockExam.findUnique({
      where: { id },
      select: { id: true, price: true, discountPrice: true, courseId: true, isActive: true },
    });
    if (!exam || !exam.isActive) {
      return NextResponse.json({ success: false, error: "ไม่พบข้อสอบจำลองที่ระบุ" }, { status: 404 });
    }

    const hasAccess = await hasMockExamAccess(userId, exam);

    return NextResponse.json({
      success: true,
      data: { hasAccess, price: exam.price, discountPrice: exam.discountPrice },
    });
  } catch (error) {
    console.error("Error checking mock exam access:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์" }, { status: 500 });
  }
}
