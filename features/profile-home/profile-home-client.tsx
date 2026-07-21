"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import LoginModal from "@/components/login-modal"
import { ProfileHeader } from "@/features/profile-home/components/profile-header"
import { ProfileNavCards } from "@/features/profile-home/components/profile-nav-cards"

export function ProfileHomeClient() {
  const { user, isAuthenticated, logout, loading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">โปรไฟล์</h1>
        {loading && !isAuthenticated ? (
          <div className="flex items-center gap-3 bg-card border rounded-lg p-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</span>
          </div>
        ) : !isAuthenticated ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border rounded-lg p-6">
            <p className="text-muted-foreground">กรุณาเข้าสู่ระบบเพื่อจัดการโปรไฟล์และการสั่งซื้อ</p>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setLoginOpen(true)}>
              เข้าสู่ระบบ
            </Button>
          </div>
        ) : (
          <ProfileHeader user={user} />
        )}
      </div>

      <ProfileNavCards />

      {isAuthenticated ? (
        <div className="pt-2">
          <Button onClick={() => logout()} variant="outline">
            ออกจากระบบ
          </Button>
        </div>
      ) : (
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      )}
    </div>
  )
}
