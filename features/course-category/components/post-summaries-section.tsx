import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { PostSummary } from "@/hooks/use-post-summaries"

export function PostSummariesSection({
  summaries,
  loading,
  cardBg = "card",
}: {
  summaries: PostSummary[]
  loading: boolean
  cardBg?: "card" | "background"
}) {
  if (loading) {
    return <div className="relative w-full aspect-[283/400] bg-muted rounded-2xl animate-pulse border border-border" />
  }

  if (!summaries.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        ไม่มีภาพสรุป
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {summaries.map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl py-0"
        >
          <CardContent className="p-0">
            <div className={`relative w-full aspect-[283/400] ${cardBg === "background" ? "bg-background" : "bg-card"}`}>
              {item.desktop && (
                <Image src={item.desktop} alt={item.title || "summary"} fill className="object-contain hidden md:block" />
              )}
              {item.mobile ? (
                <Image src={item.mobile} alt={item.title || "summary"} fill className="object-contain md:hidden" />
              ) : !item.desktop ? (
                <Image src="/placeholder.svg" alt="summary" fill className="object-contain" />
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
