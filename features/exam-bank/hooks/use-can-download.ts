import { useEffect, useState } from "react"
import { fetchCanDownload } from "@/features/exam-bank/api/fetch-can-download"

export function useCanDownload(initial: boolean) {
  const [canDownload, setCanDownload] = useState(initial)

  useEffect(() => {
    let active = true
    fetchCanDownload().then((flag) => {
      if (active) setCanDownload(flag)
    })
    return () => {
      active = false
    }
  }, [])

  return canDownload
}
