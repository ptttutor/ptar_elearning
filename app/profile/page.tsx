"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Receipt, Book, Loader2, Pencil } from "lucide-react"
import LoginModal from "@/components/login-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import http from "@/lib/http"


export default function ProfilePage() {
  const { user, isAuthenticated, logout, loading, updateUser } = useAuth()
  const { toast } = useToast()
  const [loginOpen, setLoginOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState(false)
  const [school, setSchool] = useState("")
  const [savingSchool, setSavingSchool] = useState(false)

  const name = (user as any)?.name || (user as any)?.displayName || "ผู้ใช้"
  const email = (user as any)?.email || ""
  const avatarUrl = (user as any)?.image || (user as any)?.avatarUrl || (user as any)?.picture || (user as any)?.profileImageUrl || null
  const initial = String(name || "").trim().charAt(0).toUpperCase() || "U"

  useEffect(() => {
    if (!isAuthenticated) return
    setSchool((user as any)?.school || "")
    ;(async () => {
      try {
        const res = await http.get("/api/users/me")
        if (res.data?.success) {
          setSchool(res.data.data.school || "")
          updateUser({ ...(user as any), school: res.data.data.school || "" })
        }
      } catch {}
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })()
  }, [isAuthenticated])

  const saveSchool = async () => {
    setSavingSchool(true)
    try {
      const res = await http.patch("/api/users/me", { school })
      if (res.data?.success) {
        updateUser({ ...(user as any), school: res.data.data.school || "" })
        setEditingSchool(false)
        toast({ title: "บันทึกข้อมูลโรงเรียนสำเร็จ" })
      } else {
        toast({ variant: "destructive", title: res.data?.error || "บันทึกไม่สำเร็จ" })
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: e?.response?.data?.error || "บันทึกไม่สำเร็จ" })
    } finally {
      setSavingSchool(false)
    }
  }

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
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setLoginOpen(true)}>เข้าสู่ระบบ</Button>
          </div>
        ) : (
          <div className="bg-card border rounded-lg p-6 flex items-center gap-4">
            <Avatar>
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={name} />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">{initial}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-medium text-foreground">{name}</div>
              {email && <div className="text-muted-foreground md:text-sm text-xs truncate md:max-w-full max-w-[230px]">{email}</div>}

              <Button className="mt-2 text-xs"
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(email || "")}
              >
                คัดลอกอีเมล
              </Button>

              <div className="mt-3">
                {editingSchool ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="ชื่อโรงเรียน"
                      className="h-8 max-w-[240px]"
                    />
                    <Button size="sm" disabled={savingSchool} onClick={saveSchool}>
                      {savingSchool ? <Loader2 className="h-4 w-4 animate-spin" /> : "บันทึก"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingSchool(false); setSchool((user as any)?.school || "") }}>
                      ยกเลิก
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingSchool(true)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {school ? `โรงเรียน: ${school}` : "เพิ่มชื่อโรงเรียน"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/profile/my-courses">
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow pt-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-foreground group-hover:text-primary">คอร์สของฉัน</div>
                <div className="text-sm text-muted-foreground truncate">ดูและเข้าเรียนคอร์สที่คุณซื้อไว้</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/profile/my-books">
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow pt-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Book className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-foreground group-hover:text-primary">หนังสือของฉัน</div>
                <div className="text-sm text-muted-foreground truncate">ดูและอ่าน/ดาวน์โหลด eBook ที่ซื้อไว้</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/profile/orders">
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow pt-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Receipt className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-foreground group-hover:text-primary">คำสั่งซื้อของฉัน</div>
                <div className="text-sm text-muted-foreground truncate">ตรวจสถานะและอัพโหลดอัปสลิปชำระเงิน</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {isAuthenticated ? (
        <div className="pt-2">
          <Button onClick={() => logout()} variant="outline">ออกจากระบบ</Button>
        </div>
      ) : (
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      )}
    </div>
  )
}
