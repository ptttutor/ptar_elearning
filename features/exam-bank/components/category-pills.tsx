import { Button } from "@/components/ui/button"
import type { ExamCategory } from "@/features/exam-bank/types"

export function CategoryPillsSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 w-28 rounded-full shimmer" />
      ))}
    </div>
  )
}

export function CategoryPills({
  categories,
  selectedCategory,
  onSelect,
  getCategoryColorById,
}: {
  categories: ExamCategory[]
  selectedCategory: string
  onSelect: (id: string) => void
  getCategoryColorById: (key?: string) => string
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {categories.map((category) => {
        const isActive = selectedCategory === category.id
        const color = getCategoryColorById(category.id)
        return (
          <Button
            key={category.id}
            variant={isActive ? "default" : "outline"}
            onClick={() => onSelect(category.id)}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${isActive ? "text-white shadow-lg transform scale-105" : "hover:scale-105"}`}
            style={{
              backgroundColor: isActive ? color : "transparent",
              borderColor: color,
              color: isActive ? "white" : color,
            }}
          >
            {category.name}
          </Button>
        )
      })}
    </div>
  )
}
