import type { ExamCategory } from "@/features/exam-bank/types"

const PALETTE = ["rgb(250 202 21)", "rgb(254 190 1)", "rgb(0 75 125)", "rgb(255 90 31)", "rgb(155 28 28)", "rgb(30 64 175)", "rgb(16 185 129)"]

export async function fetchExamCategories(baseUrl = ""): Promise<ExamCategory[]> {
  try {
    const res = await fetch(`${baseUrl}/api/exam-categories?limit=100`, { cache: "no-store" })
    const json: any = (await res.json().catch(() => ({}))) || {}
    const list: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
    const mapped = list.map((t: any, idx: number) => ({
      id: String(t?.id ?? t?.slug ?? t?.type ?? t?.code ?? idx),
      name: String(t?.name ?? t?.label ?? t?.type ?? `ประเภท ${idx + 1}`),
      type: String(t?.type ?? t?.slug ?? t?.code ?? t?.id ?? idx),
      color: PALETTE[idx % PALETTE.length],
    }))
    return [{ id: "all", name: "ทั้งหมด", color: "rgb(250 202 21)" }, ...mapped]
  } catch {
    return [{ id: "all", name: "ทั้งหมด", color: "rgb(250 202 21)" }]
  }
}
