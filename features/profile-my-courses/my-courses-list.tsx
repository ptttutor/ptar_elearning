"use client"

import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useMyCourses } from "@/features/profile-my-courses/hooks/use-my-courses"
import { useEnrollmentSync } from "@/features/profile-my-courses/hooks/use-enrollment-sync"
import { useCourseProgressMap } from "@/features/profile-my-courses/hooks/use-course-progress-map"
import { MyCoursesSkeleton } from "@/features/profile-my-courses/components/my-courses-skeleton"
import { MyCourseCard } from "@/features/profile-my-courses/components/my-course-card"
import { MyCoursesEmptyState } from "@/features/profile-my-courses/components/my-courses-empty-state"

export function MyCoursesList() {
  const { user, loading: authLoading } = useAuth()
  const { courses, loading, error, reload, ensuredCourseIdsRef } = useMyCourses(user?.id, authLoading)
  useEnrollmentSync({ userId: user?.id, authLoading, loading, courses, ensuredCourseIdsRef, onSynced: reload })
  const progressMap = useCourseProgressMap(user?.id, courses)

  if (authLoading && !user?.id) {
    return (
      <div className="py-12 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</span>
      </div>
    )
  }

  return (
    <div>
      {loading && <MyCoursesSkeleton />}

      {!loading && error && <div className="text-red-600">เกิดข้อผิดพลาด: {error}</div>}

      {!loading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, i) => (
            <MyCourseCard key={course.id} course={course} progress={progressMap[course.id]} priority={i === 0} />
          ))}
        </div>
      )}

      {!loading && !error && courses.length === 0 && <MyCoursesEmptyState />}
    </div>
  )
}
