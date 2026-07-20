import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/mock-exams - list active mock exams for public browsing
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 9;
    const skip = (page - 1) * limit;
    const subject = searchParams.get("subject");
    const gradeLevel = searchParams.get("gradeLevel");

    const where = {
      isActive: true,
      ...(subject && { subject }),
      ...(gradeLevel && { gradeLevel }),
    };

    const total = await prisma.mockExam.count({ where });

    const exams = await prisma.mockExam.findMany({
      where,
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: exams,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    console.error("Error fetching public mock exams:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลข้อสอบจำลอง" }, { status: 500 });
  }
}
