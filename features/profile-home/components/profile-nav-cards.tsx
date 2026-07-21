import Link from "next/link"
import { BookOpen, Book, Receipt } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const CARDS = [
  { href: "/profile/my-courses", icon: BookOpen, title: "คอร์สของฉัน", description: "ดูและเข้าเรียนคอร์สที่คุณซื้อไว้" },
  { href: "/profile/my-books", icon: Book, title: "หนังสือของฉัน", description: "ดูและอ่าน/ดาวน์โหลด eBook ที่ซื้อไว้" },
  { href: "/profile/orders", icon: Receipt, title: "คำสั่งซื้อของฉัน", description: "ตรวจสถานะและอัพโหลดอัปสลิปชำระเงิน" },
] as const

export function ProfileNavCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {CARDS.map(({ href, icon: Icon, title, description }) => (
        <Link key={href} href={href}>
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow pt-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-foreground group-hover:text-primary">{title}</div>
                <div className="text-sm text-muted-foreground truncate">{description}</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
