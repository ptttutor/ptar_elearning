import type { ReactNode } from "react"
import { PanelRightClose, PanelRightOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

type ExamSummaryDrawerProps = {
  open: boolean
  onToggle: () => void
  onClose: () => void
  children: ReactNode
}

export function ExamSummaryDrawer({ open, onToggle, onClose, children }: ExamSummaryDrawerProps) {
  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90 xl:hidden"
        onClick={onToggle}
        aria-label={open ? "ซ่อนสรุปข้อสอบ" : "แสดงสรุปข้อสอบ"}
      >
        {open ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
      </Button>

      <Button
        variant="default"
        size="icon"
        className="fixed top-1/2 right-5 z-40 hidden h-12 w-12 -translate-y-1/2 rounded-full border border-border bg-background text-foreground shadow-lg transition hover:bg-accent xl:flex"
        onClick={onToggle}
        aria-label={open ? "ซ่อนสรุปข้อสอบ" : "แสดงสรุปข้อสอบ"}
      >
        {open ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
      </Button>

      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-16 lg:top-20 bottom-0 right-0 z-40 w-full max-w-[90vw] sm:max-w-sm border border-border bg-background p-5 shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">สรุปข้อสอบ</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="ปิดสรุป">
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto pr-1 max-h-[calc(100vh-9rem)] lg:max-h-[calc(100vh-10rem)]">{children}</div>
      </div>
    </>
  )
}
