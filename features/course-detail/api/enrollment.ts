export async function fetchIsEnrolled(userId: string, courseId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/my-courses?userId=${encodeURIComponent(userId)}`, { cache: "no-store" })
    const json = await res.json().catch(() => ({}))
    if (res.ok && json && Array.isArray(json.courses)) {
      return !!json.courses.find((c: any) => c.id === courseId)
    }
  } catch {}
  return false
}

export async function fetchViewedContentIds(userId: string, courseId: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/enrollments?userId=${encodeURIComponent(userId)}&courseId=${encodeURIComponent(courseId)}`, { cache: "no-store" })
    const json = await res.json().catch(() => ({}))
    const v = json?.enrollment?.viewedContentIds
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export async function saveViewedContentIds(userId: string, courseId: string, viewedContentIds: string[]): Promise<void> {
  await fetch(`/api/enrollments`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, courseId, viewedContentIds }),
  })
}
