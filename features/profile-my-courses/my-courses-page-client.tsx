"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import LoginModal from "@/components/login-modal"
import { MyCoursesList } from "@/features/profile-my-courses/my-courses-list"

export function MyCoursesPageClient() {
  const { isAuthenticated, loading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">คอร์สของฉัน</h1>
        <p className="text-muted-foreground">ดูคอร์สที่คุณซื้อและเริ่มเรียนได้ทันที</p>
      </div>
      {loading && !isAuthenticated ? (
        <div className="bg-card border rounded-lg p-6 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</span>
        </div>
      ) : !isAuthenticated ? (
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-muted-foreground">กรุณาเข้าสู่ระบบเพื่อดูคอร์สของคุณ</div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setLoginOpen(true)}>
              เข้าสู่ระบบ
            </Button>
          </div>
          <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </div>
      ) : (
        <MyCoursesList />
      )}
    </div>
  )
}
