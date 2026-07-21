import { BookOpen as BookIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SubjectOption } from "@/features/courses-list/types"

export function SubjectSelector({ value, options, onChange }: { value: string; options: SubjectOption[]; onChange: (value: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 text-foreground mb-3">
        <BookIcon className="h-5 w-5 text-primary" />
        <span className="font-semibold">เลือกวิชา</span>
      </div>
      <div className="hidden md:flex flex-wrap justify-center gap-2">
        {options.map((s) => (
          <Button
            key={s.id}
            variant={value === s.id ? "default" : "outline"}
            className={`px-4 py-1.5 text-sm ${value === s.id ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "hover:bg-primary/10 hover:border-primary"}`}
            onClick={() => onChange(s.id)}
          >
            {s.name}
          </Button>
        ))}
      </div>
      <div className="md:hidden max-w-xs mx-auto">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือกวิชา" />
          </SelectTrigger>
          <SelectContent>
            {options.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
