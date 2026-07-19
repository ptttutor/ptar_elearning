import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEnrollmentAccess } from '@/lib/enrollmentAccess';
import { requireUser } from '@/lib/requireUser';

// GET: /api/my-courses - หาคอร์สที่จ่ายเงินแล้ว
export async function GET(req) {
  try {
    const session = await requireUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    console.log('Searching for enrolled courses for userId:', userId);
    
    // หาคอร์สที่ user ลงทะเบียนแล้ว (จากการซื้อคอร์สที่จ่ายเงินแล้ว)
    const enrolledCourses = await prisma.enrollment.findMany({
      where: { 
        userId: userId,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true }
            },
            category: {
              select: { id: true, name: true }
            },
            // This is a list view — only the chapter count is displayed
            // (see my-courses.tsx), so avoid pulling every chapter's full
            // content list (titles, URLs) for every enrolled course.
            _count: {
              select: { chapters: true }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });
    
    console.log('Total enrolled courses:', enrolledCourses.length);
    
    if (enrolledCourses.length === 0) {
      return NextResponse.json({ 
        success: true, 
        courses: [],
        count: 0,
        message: 'No enrolled courses found'
      });
    }
    

    // แปลงข้อมูลให้เหมาะสม พร้อมเช็คหมดอายุ (รองรับ override รายบุคคล)
    const courses = enrolledCourses.map(enrollment => {
      const { expiresAt, isExpire } = resolveEnrollmentAccess(enrollment, enrollment.course);
      return {
        ...enrollment.course,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
        enrollmentId: enrollment.id,
        enrollmentStatus: enrollment.status,
        isExpire,
        expiresAt: expiresAt.toISOString()
      };
    });

    return NextResponse.json({ 
      success: true, 
      courses: courses,
      count: courses.length 
    });
    
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}