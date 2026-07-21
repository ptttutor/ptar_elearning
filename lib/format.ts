export function formatCurrency(value?: number | null): string {
  const numeric = Number(value ?? 0)
  const safeNumber = Number.isFinite(numeric) ? numeric : 0
  return `฿${safeNumber.toLocaleString()}`
}
