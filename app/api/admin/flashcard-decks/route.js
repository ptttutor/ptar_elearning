import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// GET - รายการชุดแฟลชการ์ด
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
    const gradeLevel = searchParams.get("gradeLevel") || "";
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
      ...(gradeLevel && { gradeLevel }),
      ...(status === "active" && { isActive: true }),
      ...(status === "inactive" && { isActive: false }),
    };

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const totalCount = await prisma.flashcardDeck.count({ where });

    const decks = await prisma.flashcardDeck.findMany({
      where,
      include: {
        topic: { select: { id: true, name: true } },
        _count: { select: { cards: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: decks,
      pagination: { page, pageSize, totalCount, totalPages },
    });
  } catch (error) {
    console.error("Error fetching flashcard decks:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลชุดแฟลชการ์ด",
    }, { status: 500 });
  }
}

// POST - สร้างชุดแฟลชการ์ดใหม่
export async function POST(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, subject, gradeLevel, topicId, coverImageUrl, isActive } = data;

    if (!title || !subject) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (ชื่อชุด, วิชา)",
      }, { status: 400 });
    }

    if (topicId) {
      const topicExists = await prisma.mockTopic.findUnique({ where: { id: topicId } });
      if (!topicExists) {
        return NextResponse.json({
          success: false,
          error: "ไม่พบหัวข้อที่ระบุ",
        }, { status: 404 });
      }
    }

    const deck = await prisma.flashcardDeck.create({
      data: {
        title,
        description: description || null,
        subject,
        gradeLevel: gradeLevel || null,
        topicId: topicId || null,
        coverImageUrl: coverImageUrl || null,
        isActive: isActive ?? true,
      },
      include: {
        topic: { select: { id: true, name: true } },
        _count: { select: { cards: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: deck,
      message: "สร้างชุดแฟลชการ์ดสำเร็จ",
    });
  } catch (error) {
    console.error("Error creating flashcard deck:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการสร้างชุดแฟลชการ์ด",
    }, { status: 500 });
  }
}
