import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/requireUser';

// POST: /api/update-progress - อัพเดทความคืบหน้าการเรียน
export async function POST(req) {
  try {
    const session = await requireUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, contentId } = await req.json();
    const userId = session.userId;

    if (!userId || !courseId || !contentId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามี enrollment หรือไม่
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" }, 
        { status: 404 }
      );
    }

    // ดึงข้อมูลคอร์สเพื่อคำนวณ progress
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            contents: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" }, 
        { status: 404 }
      );
    }

    // รวบรวม content ids ทั้งหมดของคอร์ส
    const contentIds = course.chapters.flatMap((chapter) => 
      chapter.contents.map((c) => c.id)
    );
    const totalContents = contentIds.length;

    if (totalContents === 0) {
      return NextResponse.json(
        { success: false, error: "No contents found in course" }, 
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามี content นี้ในคอร์สไหม
    if (!contentIds.includes(contentId)) {
      return NextResponse.json(
        { success: false, error: "Content not found" }, 
        { status: 404 }
      );
    }

    // รวมรายการที่ดูแล้ว (กัน duplicate และกัน id แปลกปลอม)
    const currentViewed = Array.isArray(enrollment.viewedContentIds) ? enrollment.viewedContentIds : [];
    const nextViewedSet = new Set([
      ...contentIds.filter((id) => currentViewed.includes(id)),
      contentId
    ]);
    const viewedList = contentIds.filter((id) => nextViewedSet.has(id));

    // คำนวณ progress จากจำนวนเนื้อหาที่ดูจริง
    const progress = Math.round((viewedList.length / totalContents) * 100);

    // อัพเดท enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      },
      data: {
        viewedContentIds: viewedList,
        progress: progress,
        status: progress >= 100 ? 'COMPLETED' : 'ACTIVE'
      }
    });

    return NextResponse.json({ 
      success: true, 
      progress: updatedEnrollment.progress,
      status: updatedEnrollment.status,
      viewedContentIds: updatedEnrollment.viewedContentIds || [],
      data: {
        progress: updatedEnrollment.progress,
        status: updatedEnrollment.status,
        viewedContentIds: updatedEnrollment.viewedContentIds || []
      },
      message: `Progress updated to ${progress}%`
    });
    
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}
