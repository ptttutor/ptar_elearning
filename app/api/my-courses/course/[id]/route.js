import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEnrollmentAccess } from '@/lib/enrollmentAccess';
import { requireUser } from '@/lib/requireUser';

// GET: /api/my-courses/course/[id] - ดึงข้อมูลคอร์สพร้อม chapters และ contents
export async function GET(req, { params }) {
  try {
    const session = await requireUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const userId = session.userId;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    // ดึงข้อมูลคอร์สพร้อม chapters และ contents
    const course = await prisma.course.findUnique({
      where: { id: id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        chapters: {
          include: {
            contents: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        enrollments: userId ? {
          where: {
            userId: userId
          }
        } : false,
        _count: {
          select: {
            enrollments: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // ข้อมูล enrollment ถ้ามี userId — บล็อกการเข้าถึงเนื้อหาถ้าหมดอายุหรือถูกยกเลิก
    let enrollmentInfo = null;
    if (userId && course.enrollments && course.enrollments.length > 0) {
      const enrollment = course.enrollments[0];
      const { expiresAt, isExpire } = resolveEnrollmentAccess(enrollment, course);

      if (enrollment.status === 'CANCELED') {
        return NextResponse.json(
          { success: false, error: 'คอร์สนี้ถูกยกเลิกแล้ว', canceled: true },
          { status: 403 }
        );
      }
      if (isExpire) {
        return NextResponse.json(
          { success: false, error: 'คอร์สหมดอายุแล้ว', isExpire: true, expiresAt: expiresAt.toISOString() },
          { status: 403 }
        );
      }

      enrollmentInfo = {
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
        status: enrollment.status,
        viewedContentIds: enrollment.viewedContentIds || [],
        expiresAt: expiresAt.toISOString()
      };
    }

    // คำนวณสถิติ
    const totalChapters = course.chapters.length;
    const totalContents = course.chapters.reduce((total, chapter) =>
      total + chapter.contents.length, 0
    );

    // สร้าง response data
    const responseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      duration: course.duration,
      isFree: course.isFree,
      status: course.status,
      coverImageUrl: course.coverImageUrl,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      instructor: course.instructor,
      category: course.category,
      chapters: course.chapters,
      stats: {
        totalChapters,
        totalContents,
        totalEnrollments: course._count.enrollments
      },
      enrollment: enrollmentInfo
    };

    return NextResponse.json({
      success: true,
      course: responseData
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
