export function formatCurrency(value?: number | null): string {
  const numeric = Number(value ?? 0)
  const safeNumber = Number.isFinite(numeric) ? numeric : 0
  return `฿${safeNumber.toLocaleString()}`
}

/** "H:MM:SS" once past an hour, else "MM:SS". Used by every exam-attempt countdown (course exams, mock exams). */
export function formatCountdown(seconds: number | null): string {
  if (seconds == null) return "-"
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}
