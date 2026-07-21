import type { SummaryRow } from "@/features/order-success/types"

export function OrderPriceSummary({ rows }: { rows: SummaryRow[] }) {
  return (
    <div className="space-y-2 sm:max-w-md">
      <div className="text-sm font-medium text-gray-700">สรุปราคา</div>
      <div className="overflow-hidden rounded-lg border bg-white">
        {rows.map((row, idx) => {
          const isLast = idx === rows.length - 1
          const common = row.accent ? "py-3 text-sm font-semibold text-gray-900" : "py-2 text-sm text-gray-700"
          const border = !isLast ? "border-b" : ""
          return (
            <div key={`${row.label}-${idx}`} className={`flex items-center justify-between px-4 ${common} ${border}`}>
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
