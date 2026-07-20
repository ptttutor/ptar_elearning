"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import http from "@/lib/http"

type ApiMockExam = {
  id: string
  title: string
  description?: string | null
  price: number
  discountPrice?: number | null
}

export default function CheckoutMockExamPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const search = useSearchParams()
  const { isAuthenticated, user, loading: authLoading } = useAuth()

  const couponFromQuery = (search.get("coupon") || "").trim()
  const authUserId = (user as any)?.id ?? null

  const [exam, setExam] = useState<ApiMockExam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)

  const [couponCode, setCouponCode] = useState<string>("")
  const [discount, setDiscount] = useState<number>(0)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const lastAutoAppliedCoupon = useRef<string | null>(null)

  useEffect(() => {
    if (!couponFromQuery) {
      lastAutoAppliedCoupon.current = null
      return
    }
    setCouponCode(couponFromQuery)
    setDiscount(0)
    setCouponError(null)
    lastAutoAppliedCoupon.current = null
  }, [couponFromQuery])

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!id) return
      try {
        setLoading(true)
        const res = await fetch(`/api/mock-exams/${encodeURIComponent(id)}`, { cache: "no-store" })
        const json = await res.json().catch(() => ({ success: false }))
        if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)
        if (active) setExam(json.data || null)
      } catch (e: any) {
        if (active) setError(e?.message || "โหลดข้อมูลไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  // Already-paid guard: redirect straight to the exam instead of letting the
  // student pay twice (uses the real entitlement check, not the legacy
  // order.orderType-based lookup the course checkout page relies on).
  useEffect(() => {
    let abort = false
    ;(async () => {
      if (authLoading) {
        setCheckingAccess(true)
        return
      }
      if (!isAuthenticated || !id) {
        setCheckingAccess(false)
        return
      }
      try {
        setCheckingAccess(true)
        const res = await http.get(`/api/mock-exams/${id}/access`)
        if (!abort && res.data?.success && res.data?.data?.hasAccess) {
          router.replace(`/mock-exams/${encodeURIComponent(String(id))}`)
          return
        }
      } catch {}
      finally {
        if (!abort) setCheckingAccess(false)
      }
    })()
    return () => {
      abort = true
    }
  }, [id, isAuthenticated, authLoading, router])

  const price = useMemo(() => {
    if (!exam) return 0
    if ((exam.price ?? 0) === 0) return 0
    const original = Number(exam.price || 0)
    const d = exam.discountPrice as number | null | undefined
    if (d != null && d < original) return Number(d)
    return original
  }, [exam])

  const finalTotal = Math.max(0, (price || 0) - (discount || 0))

  const validateCoupon = useCallback(
    async (code: string) => {
      if (!exam) return
      if (!code) {
        setCouponError("กรอกรหัสคูปอง")
        setDiscount(0)
        return
      }
      try {
        setValidatingCoupon(true)
        setCouponError(null)
        const res = await fetch(`/api/coupons/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            userId: authUserId ?? "guest",
            itemType: "mock_exam",
            itemId: exam.id,
            subtotal: price,
          }),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok || json?.success === false) throw new Error(json?.error || "ใช้คูปองไม่สำเร็จ")
        setDiscount(Number(json?.data?.discount || 0))
      } catch (e: any) {
        setCouponError(e?.message ?? "ใช้คูปองไม่สำเร็จ")
        setDiscount(0)
      } finally {
        setValidatingCoupon(false)
      }
    },
    [exam, price, authUserId]
  )

  const applyCoupon = async () => {
    await validateCoupon(couponCode)
  }

  useEffect(() => {
    if (!couponFromQuery) return
    if (!exam) return
    if (!couponCode) return
    if (price <= 0) return
    if (lastAutoAppliedCoupon.current === couponFromQuery) return
    lastAutoAppliedCoupon.current = couponFromQuery
    void validateCoupon(couponFromQuery)
  }, [couponFromQuery, exam, couponCode, price, validateCoupon])

  const confirmOrder = async () => {
    if (!exam) return
    if (!isAuthenticated) {
      router.push(`/mock-exams/${encodeURIComponent(String(id))}`)
      return
    }
    try {
      setCreating(true)
      const res = await http.post(`/api/orders`, {
        items: [
          {
            itemType: "MOCK_EXAM",
            itemId: exam.id,
            title: exam.title,
            quantity: 1,
            unitPrice: price,
          },
        ],
        couponCode: couponCode || undefined,
      })
      if (!res.data?.success) throw new Error(res.data?.error || "สร้างคำสั่งซื้อไม่สำเร็จ")
      const oid = String(res.data?.data?.orderId)
      router.push(`/order-success/${encodeURIComponent(oid)}`)
    } catch (e: any) {
      setCouponError(e?.response?.data?.error || e?.message || "สร้างคำสั่งซื้อไม่สำเร็จ")
    } finally {
      setCreating(false)
    }
  }

  if (checkingAccess) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-foreground">ยืนยันการสั่งซื้อข้อสอบจำลอง</h1>

      {loading && <div className="text-muted-foreground">กำลังโหลด...</div>}
      {error && <div className="text-destructive">{error}</div>}
      {!loading && !error && exam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{exam.title}</span>
              {price === 0 && <Badge className="bg-green-600 text-white">ฟรี</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {price > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input placeholder="รหัสคูปอง" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                  <Button onClick={applyCoupon} disabled={validatingCoupon}>
                    {validatingCoupon ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ตรวจสอบ...
                      </>
                    ) : (
                      "ใช้คูปอง"
                    )}
                  </Button>
                </div>
                {couponError && <div className="text-xs text-destructive">{couponError}</div>}
                {discount > 0 && <div className="text-xs text-green-600">ส่วนลด ฿{discount.toLocaleString()}</div>}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">ยอดชำระ</div>
                  <div className="text-lg font-semibold text-foreground">฿{finalTotal.toLocaleString()}</div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                ยกเลิก
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={confirmOrder} disabled={creating}>
                {creating ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังสร้างคำสั่งซื้อ...
                  </span>
                ) : (
                  "ยืนยันการสั่งซื้อ"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-lg bg-background px-6 py-4 shadow-lg border">
            <div className="flex items-center gap-3 text-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>กำลังดำเนินการคำสั่งซื้อของคุณ...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
