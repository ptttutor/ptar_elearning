import { GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GradeLevel, GRADE_LEVEL_LABELS } from "@/features/courses-list/types"

const LEVELS = [
  { id: "all", name: "ทุกระดับ" },
  { id: GradeLevel.JUNIOR_HIGH, name: GRADE_LEVEL_LABELS[GradeLevel.JUNIOR_HIGH] },
  { id: GradeLevel.SENIOR_HIGH, name: GRADE_LEVEL_LABELS[GradeLevel.SENIOR_HIGH] },
]

export function GradeLevelSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 text-foreground mb-3">
        <GraduationCap className="h-5 w-5 text-primary" />
        <span className="font-semibold">เลือกระดับ</span>
      </div>
      <div className="hidden md:flex flex-wrap justify-center gap-3">
        {LEVELS.map((level) => (
          <Button
            key={level.id}
            variant={value === level.id ? "default" : "outline"}
            className={`px-5 py-2 ${value === level.id ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "hover:bg-primary/10 hover:border-primary"}`}
            onClick={() => onChange(level.id)}
          >
            {level.name}
          </Button>
        ))}
      </div>
      <div className="md:hidden max-w-xs mx-auto">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือกระดับ" />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
