import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/mock-exams/[id] - public detail view of one active mock exam
// (question content/answers are intentionally NOT included — this only
// shows the exam's metadata for browsing, not the questions themselves).
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const exam = await prisma.mockExam.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { questions: true } },
      },
    });

    if (!exam || !exam.isActive) {
      return NextResponse.json({ success: false, error: "ไม่พบข้อสอบจำลองที่ระบุ" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error("Error fetching public mock exam:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลข้อสอบจำลอง" }, { status: 500 });
  }
}
