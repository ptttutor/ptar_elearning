import { Star } from "lucide-react"

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "h-5 w-5",
}: {
  value: number
  onChange?: (v: number) => void
  readOnly?: boolean
  size?: string
}) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => {
        const active = s <= Math.round(value)
        const cls = active ? "text-primary" : "text-muted-foreground"
        return (
          <button
            type="button"
            key={s}
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(s)}
            className={`cursor-pointer transition-transform ${readOnly ? "cursor-default" : "hover:scale-110"}`}
            aria-label={`${s} ดาว`}
          >
            <Star className={`${size} ${cls} fill-current`} />
          </button>
        )
      })}
    </div>
  )
}
