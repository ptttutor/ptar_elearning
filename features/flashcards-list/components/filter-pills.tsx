import { Button } from "@/components/ui/button"

type Option = { value: string; label: string }

export function FilterPills({
  options,
  value,
  onChange,
  size = "sm",
}: {
  options: Option[]
  value: string
  onChange: (value: string) => void
  size?: "sm" | "lg"
}) {
  const sizeClass = size === "lg" ? "px-5 py-2" : "px-4 py-1.5 text-sm"
  const gapClass = size === "lg" ? "gap-3" : "gap-2"
  return (
    <div className={`flex flex-wrap justify-center ${gapClass}`}>
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? "default" : "outline"}
          className={`${sizeClass} ${value === opt.value ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "hover:bg-primary/10 hover:border-primary"}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
