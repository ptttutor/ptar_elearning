import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type CouponInputProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  onValidate: () => void
  validating: boolean
  disabled?: boolean
  error?: string | null
  successMessage?: string | null
  /** "stacked": label above a full-width input+button row (cart-style summary card).
   *  "inline": no label, compact input+button row (single-item checkout cards). */
  layout?: "stacked" | "inline"
}

export function CouponInput({
  label = "โค้ดส่วนลด",
  value,
  onChange,
  onValidate,
  validating,
  disabled,
  error,
  successMessage,
  layout = "inline",
}: CouponInputProps) {
  const row = (
    <div className={layout === "stacked" ? "flex flex-col gap-2 sm:flex-row" : "flex items-center gap-2"}>
      <Input
        placeholder={layout === "stacked" ? "กรอกรหัสคูปอง" : "รหัสคูปอง"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || validating}
      />
      <Button
        type="button"
        variant={layout === "stacked" ? "outline" : "default"}
        className={layout === "stacked" ? "whitespace-nowrap sm:w-auto" : undefined}
        onClick={onValidate}
        disabled={disabled || validating || !value.trim()}
      >
        {validating ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> ตรวจสอบ...
          </span>
        ) : layout === "stacked" ? (
          "ตรวจสอบคูปอง"
        ) : (
          "ใช้คูปอง"
        )}
      </Button>
    </div>
  )

  return (
    <div className="space-y-2">
      {layout === "stacked" && (
        <label className="text-sm font-medium text-foreground" htmlFor="coupon">
          {label}
        </label>
      )}
      {row}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {successMessage && !error && <p className="text-xs text-green-600">{successMessage}</p>}
    </div>
  )
}
