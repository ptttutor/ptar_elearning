import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// PUT - แก้ไขหัวข้อ
export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const { subject, name } = data;

    const existingTopic = await prisma.mockTopic.findUnique({ where: { id } });
    if (!existingTopic) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบหัวข้อที่ระบุ",
      }, { status: 404 });
    }

    if (!subject || !name) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (วิชา, ชื่อหัวข้อ)",
      }, { status: 400 });
    }

    const duplicate = await prisma.mockTopic.findUnique({
      where: { subject_name: { subject, name } },
    });
    if (duplicate && duplicate.id !== id) {
      return NextResponse.json({
        success: false,
        error: "มีหัวข้อนี้อยู่แล้วในวิชานี้",
      }, { status: 400 });
    }

    const updatedTopic = await prisma.mockTopic.update({
      where: { id },
      data: { subject, name, updatedAt: new Date() },
      include: {
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTopic,
      message: "แก้ไขหัวข้อสำเร็จ",
    });
  } catch (error) {
    console.error("Error updating mock topic:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการแก้ไขหัวข้อ",
    }, { status: 500 });
  }
}

// DELETE - ลบหัวข้อ
export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingTopic = await prisma.mockTopic.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    });

    if (!existingTopic) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบหัวข้อที่ระบุ",
      }, { status: 404 });
    }

    if (existingTopic._count.questions > 0) {
      return NextResponse.json({
        success: false,
        error: "ไม่สามารถลบหัวข้อที่มีคำถามผูกอยู่ได้",
      }, { status: 400 });
    }

    await prisma.mockTopic.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "ลบหัวข้อสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting mock topic:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการลบหัวข้อ",
    }, { status: 500 });
  }
}
