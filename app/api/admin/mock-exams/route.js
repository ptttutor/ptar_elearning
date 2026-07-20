import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// GET - รายการข้อสอบจำลอง
export async function GET(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const search = searchParams.get("search") || "";
    const subject = searchParams.get("subject") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(subject && { subject }),
      ...(status === "active" && { isActive: true }),
      ...(status === "inactive" && { isActive: false }),
    };

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const totalCount = await prisma.mockExam.count({ where });

    const exams = await prisma.mockExam.findMany({
      where,
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: exams,
      pagination: { page, pageSize, totalCount, totalPages },
    });
  } catch (error) {
    console.error("Error fetching mock exams:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลข้อสอบจำลอง",
    }, { status: 500 });
  }
}

// POST - สร้างข้อสอบจำลองใหม่
export async function POST(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      title,
      description,
      courseId,
      subject,
      gradeLevel,
      timeLimit,
      passingMarks,
      attemptsAllowed,
      allowPracticeMode,
      allowRealMode,
      practiceUnlockCost,
      isActive,
    } = data;

    if (!title || !subject) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (ชื่อข้อสอบ, วิชา)",
      }, { status: 400 });
    }

    if (courseId) {
      const courseExists = await prisma.course.findUnique({ where: { id: courseId } });
      if (!courseExists) {
        return NextResponse.json({
          success: false,
          error: "ไม่พบคอร์สที่ระบุ",
        }, { status: 404 });
      }
    }

    if (!allowPracticeMode && !allowRealMode) {
      return NextResponse.json({
        success: false,
        error: "ต้องเปิดใช้งานอย่างน้อยหนึ่งโหมด (ฝึกฝน หรือ สอบจริง)",
      }, { status: 400 });
    }

    const exam = await prisma.mockExam.create({
      data: {
        title,
        description: description || null,
        courseId: courseId || null,
        subject,
        gradeLevel: gradeLevel || null,
        timeLimit: timeLimit || null,
        passingMarks: passingMarks || 0,
        attemptsAllowed: attemptsAllowed || 1,
        allowPracticeMode: allowPracticeMode ?? true,
        allowRealMode: allowRealMode ?? true,
        practiceUnlockCost: practiceUnlockCost ?? 1,
        isActive: isActive ?? true,
      },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { questions: true, attempts: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: exam,
      message: "สร้างข้อสอบจำลองสำเร็จ",
    });
  } catch (error) {
    console.error("Error creating mock exam:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการสร้างข้อสอบจำลอง",
    }, { status: 500 });
  }
}
