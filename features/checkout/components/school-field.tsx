import { Input } from "@/components/ui/input"

type SchoolFieldProps = {
  school: string | null
  schoolInput: string
  onSchoolInputChange: (value: string) => void
}

export function SchoolField({ school, schoolInput, onSchoolInputChange }: SchoolFieldProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">โรงเรียน</div>
      {school ? (
        <p className="text-sm text-muted-foreground">{school}</p>
      ) : (
        <Input
          placeholder="ชื่อโรงเรียน"
          value={schoolInput}
          onChange={(event) => onSchoolInputChange(event.target.value)}
        />
      )}
    </div>
  )
}
