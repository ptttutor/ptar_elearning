import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// GET - ดึงข้อมูลชุดแฟลชการ์ดเดี่ยว (ใช้เป็น context header ของหน้าจัดการการ์ด)
export async function GET(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deck = await prisma.flashcardDeck.findUnique({
      where: { id },
      include: {
        topic: { select: { id: true, name: true } },
        _count: { select: { cards: true } },
      },
    });

    if (!deck) {
      return NextResponse.json({ success: false, error: "ไม่พบชุดแฟลชการ์ดที่ระบุ" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deck });
  } catch (error) {
    console.error("Error fetching flashcard deck:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลชุดแฟลชการ์ด",
    }, { status: 500 });
  }
}

// PUT - แก้ไขชุดแฟลชการ์ด
export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const { title, description, subject, gradeLevel, topicId, coverImageUrl, isActive, newCardsPerDay } = data;

    const existingDeck = await prisma.flashcardDeck.findUnique({ where: { id } });
    if (!existingDeck) {
      return NextResponse.json({ success: false, error: "ไม่พบชุดแฟลชการ์ดที่ระบุ" }, { status: 404 });
    }

    if (!title || !subject) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (ชื่อชุด, วิชา)",
      }, { status: 400 });
    }

    if (topicId) {
      const topicExists = await prisma.mockTopic.findUnique({ where: { id: topicId } });
      if (!topicExists) {
        return NextResponse.json({ success: false, error: "ไม่พบหัวข้อที่ระบุ" }, { status: 404 });
      }
    }

    const deck = await prisma.flashcardDeck.update({
      where: { id },
      data: {
        title,
        description: description || null,
        subject,
        gradeLevel: gradeLevel || null,
        topicId: topicId || null,
        coverImageUrl: coverImageUrl || null,
        isActive: isActive ?? existingDeck.isActive,
        newCardsPerDay: newCardsPerDay != null ? parseInt(newCardsPerDay, 10) : existingDeck.newCardsPerDay,
        updatedAt: new Date(),
      },
      include: {
        topic: { select: { id: true, name: true } },
        _count: { select: { cards: true } },
      },
    });

    return NextResponse.json({ success: true, data: deck, message: "แก้ไขชุดแฟลชการ์ดสำเร็จ" });
  } catch (error) {
    console.error("Error updating flashcard deck:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการแก้ไขชุดแฟลชการ์ด",
    }, { status: 500 });
  }
}

// DELETE - ลบชุดแฟลชการ์ด
// บล็อกการลบจริงถ้ามีนักเรียนเริ่มทบทวนการ์ดในชุดนี้แล้ว (มี FlashcardReview
// ผูกอยู่) เพื่อไม่ให้ประวัติการเรียนของนักเรียนหาย — แนะนำให้ปิดการใช้งาน
// (isActive = false) ผ่าน PUT แทน
export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingDeck = await prisma.flashcardDeck.findUnique({
      where: { id },
      include: { _count: { select: { cards: true } } },
    });

    if (!existingDeck) {
      return NextResponse.json({ success: false, error: "ไม่พบชุดแฟลชการ์ดที่ระบุ" }, { status: 404 });
    }

    const reviewCount = await prisma.flashcardReview.count({
      where: { card: { deckId: id } },
    });

    if (reviewCount > 0) {
      return NextResponse.json({
        success: false,
        error: `ไม่สามารถลบได้ เนื่องจากมีนักเรียนทบทวนการ์ดในชุดนี้ไปแล้ว ${reviewCount} รายการ — กรุณาปิดการใช้งานชุดนี้แทน`,
      }, { status: 400 });
    }

    await prisma.flashcardDeck.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "ลบชุดแฟลชการ์ดสำเร็จ" });
  } catch (error) {
    console.error("Error deleting flashcard deck:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการลบชุดแฟลชการ์ด",
    }, { status: 500 });
  }
}
