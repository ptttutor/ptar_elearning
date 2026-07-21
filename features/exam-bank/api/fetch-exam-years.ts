export async function fetchExamYears(baseUrl = ""): Promise<number[]> {
  try {
    const res = await fetch(`${baseUrl}/api/exams/years`, { cache: "no-store" })
    if (!res.ok) return []
    const json = await res.json().catch(() => ({}))
    const arr = (json?.data ?? json ?? []) as number[]
    if (!Array.isArray(arr) || !arr.length) return []
    return Array.from(new Set(arr)).sort((a, b) => b - a)
  } catch {
    return []
  }
}
