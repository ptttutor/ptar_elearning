import type { ReactNode } from "react"

export function ExamSummarySidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="w-72 shrink-0 space-y-4 sticky top-4">
      <div className="rounded-xl border bg-gradient-to-br from-card via-card to-accent/20 p-4 shadow-sm ring-1 ring-border">
        <h3 className="text-sm font-semibold text-foreground">สรุปข้อสอบ</h3>
        {children}
      </div>
    </aside>
  )
}
