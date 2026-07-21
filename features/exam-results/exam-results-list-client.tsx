"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-provider"
import { useExamResultsList } from "@/features/exam-results/hooks/use-exam-results-list"
import { AttemptCard } from "@/features/exam-results/components/attempt-card"

export function ExamResultsListClient() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { attempts, loading, error } = useExamResultsList((user as any)?.id)

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-lg p-6 text-gray-700">โปรดเข้าสู่ระบบ</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ประวัติการทำข้อสอบ</h1>
        <Button variant="outline" onClick={() => router.push("/profile/my-courses")}>
          กลับไปหน้าคอร์สของฉัน
        </Button>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && attempts.length === 0 && <div className="text-gray-600">ยังไม่มีประวัติการทำข้อสอบ</div>}

      <div className="grid gap-4">
        {attempts.map((attempt) => (
          <AttemptCard key={attempt.id} attempt={attempt} />
        ))}
      </div>
    </div>
  )
}
