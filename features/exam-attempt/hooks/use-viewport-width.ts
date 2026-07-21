import { useEffect, useState } from "react"

export function useViewportWidth() {
  const [viewportWidth, setViewportWidth] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const updateWidth = () => setViewportWidth(window.innerWidth)
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  return viewportWidth
}
