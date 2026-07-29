import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PaginationControls({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(max-width: 480px)")
    const handleChange = (event: MediaQueryListEvent) => setIsCompact(event.matches)
    setIsCompact(mq.matches)
    mq.addEventListener("change", handleChange)
    return () => mq.removeEventListener("change", handleChange)
  }, [])

  const pageList = useMemo<(number | "...")[]>(() => {
    if (totalPages <= 1) return [1]
    if (isCompact) {
      const visible = 3
      if (totalPages <= visible) return Array.from({ length: totalPages }, (_, idx) => idx + 1)
      let start = Math.max(1, currentPage - Math.floor(visible / 2))
      let end = start + visible - 1
      if (end > totalPages) {
        end = totalPages
        start = Math.max(1, end - visible + 1)
      }
      return Array.from({ length: visible }, (_, idx) => start + idx)
    }
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, idx) => idx + 1)
    const pages: Array<number | "..."> = [1]
    const middleStart = Math.max(2, currentPage - 2)
    const middleEnd = Math.min(totalPages - 1, currentPage + 2)
    if (middleStart > 2) pages.push("...")
    for (let p = middleStart; p <= middleEnd; p += 1) pages.push(p)
    if (middleEnd < totalPages - 1) pages.push("...")
    pages.push(totalPages)
    return pages
  }, [currentPage, totalPages, isCompact])

  const navButtonClass = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0 hover:bg-blue-50 hover:border-blue-400"

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1} className={navButtonClass}>
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={navButtonClass}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageList.map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className="flex h-9 w-9 shrink-0 items-center justify-center text-gray-400">
            &#8230;
          </span>
        ) : (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`flex h-9 min-w-[2.5rem] shrink-0 items-center justify-center rounded-full px-0 ${
              currentPage === page ? "bg-blue-400 hover:bg-blue-500 text-white" : "hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            {page}
          </Button>
        )
      )}

      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={navButtonClass}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={navButtonClass}>
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </>
  )
}
