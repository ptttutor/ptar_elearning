import { Button } from "@/components/ui/button"
import type { BookCategory } from "@/features/books-list/types"

export function CategoryFilter({ categories, value, onChange }: { categories: BookCategory[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="mb-6 flex flex-wrap justify-center gap-3">
      {categories.map((c) => (
        <Button
          key={c.id}
          variant={value === c.id ? "default" : "outline"}
          onClick={() => onChange(c.id)}
          className={`px-5 rounded-full ${value === c.id ? "bg-primary text-primary-foreground" : ""}`}
        >
          {c.name}
        </Button>
      ))}
    </div>
  )
}
