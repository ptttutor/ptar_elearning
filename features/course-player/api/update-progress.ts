import { authHeaders } from "@/lib/auth-headers"

export type ProgressUpdateResult = {
  success: boolean
  viewedContentIds?: string[]
  progress?: number
  status?: string
  data?: { viewedContentIds?: string[]; progress?: number; status?: string }
}

export async function postProgressUpdate(userId: string, courseId: string, contentId: string): Promise<ProgressUpdateResult> {
  const res = await fetch("/api/update-progress", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ userId, courseId, contentId }),
  })
  const result = await res.json()
  if (!res.ok || !result?.success) {
    throw new Error(result?.error || "อัพเดทความคืบหน้าไม่สำเร็จ")
  }
  return result
}
