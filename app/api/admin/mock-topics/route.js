import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// GET - รายการหัวข้อ (topics)
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
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where = {
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
      ...(subject && { subject }),
    };

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const totalCount = await prisma.mockTopic.count({ where });

    const topics = await prisma.mockTopic.findMany({
      where,
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: topics,
      pagination: { page, pageSize, totalCount, totalPages },
    });
  } catch (error) {
    console.error("Error fetching mock topics:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลหัวข้อ",
    }, { status: 500 });
  }
}

// POST - สร้างหัวข้อใหม่
export async function POST(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { subject, name } = data;

    if (!subject || !name) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (วิชา, ชื่อหัวข้อ)",
      }, { status: 400 });
    }

    const existing = await prisma.mockTopic.findUnique({
      where: { subject_name: { subject, name } },
    });
    if (existing) {
      return NextResponse.json({
        success: false,
        error: "มีหัวข้อนี้อยู่แล้วในวิชานี้",
      }, { status: 400 });
    }

    const topic = await prisma.mockTopic.create({
      data: { subject, name },
      include: {
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: topic,
      message: "สร้างหัวข้อสำเร็จ",
    });
  } catch (error) {
    console.error("Error creating mock topic:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการสร้างหัวข้อ",
    }, { status: 500 });
  }
}
