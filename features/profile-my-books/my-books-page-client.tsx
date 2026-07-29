"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import LoginModal from "@/components/login-modal"
import { MyBooksList } from "@/features/profile-my-books/my-books-list"

export function MyBooksPageClient() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">หนังสือของฉัน</h1>
        <p className="text-gray-600">ดู eBook ที่คุณซื้อและอ่าน/ดาวน์โหลด</p>
      </div>

      {authLoading && !isAuthenticated ? (
        <div className="bg-white border rounded-lg p-6 flex items-center gap-3 text-gray-700">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</span>
        </div>
      ) : !isAuthenticated ? (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-gray-700">กรุณาเข้าสู่ระบบเพื่อดู eBook ของคุณ</div>
            <Button className="bg-blue-400 hover:bg-blue-500 text-white" onClick={() => setLoginOpen(true)}>
              เข้าสู่ระบบ
            </Button>
          </div>
          <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </div>
      ) : (
        <MyBooksList />
      )}
    </div>
  )
}
