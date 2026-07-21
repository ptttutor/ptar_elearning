export function isPaidLikeStatus(status?: string | null): boolean {
  const s = (status || "").toUpperCase()
  return ["COMPLETED", "PAID", "APPROVED", "SUCCESS"].includes(s)
}
