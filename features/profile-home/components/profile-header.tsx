import { Loader2, Pencil } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSchoolEditor } from "@/features/profile-home/hooks/use-school-editor"

export function ProfileHeader({ user }: { user: any }) {
  const { editingSchool, setEditingSchool, school, setSchool, savingSchool, saveSchool, cancelEdit } = useSchoolEditor()

  const name = user?.name || user?.displayName || "ผู้ใช้"
  const email = user?.email || ""
  const avatarUrl = user?.image || user?.avatarUrl || user?.picture || user?.profileImageUrl || null
  const initial = String(name || "").trim().charAt(0).toUpperCase() || "U"

  return (
    <div className="bg-card border rounded-lg p-6 flex items-center gap-4">
      <Avatar>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : <AvatarFallback className="bg-primary text-primary-foreground">{initial}</AvatarFallback>}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-lg font-medium text-foreground">{name}</div>
        {email && <div className="text-muted-foreground md:text-sm text-xs truncate md:max-w-full max-w-[230px]">{email}</div>}

        <Button className="mt-2 text-xs" variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(email || "")}>
          คัดลอกอีเมล
        </Button>

        <div className="mt-3">
          {editingSchool ? (
            <div className="flex items-center gap-2">
              <Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="ชื่อโรงเรียน" className="h-8 max-w-[240px]" />
              <Button size="sm" disabled={savingSchool} onClick={saveSchool}>
                {savingSchool ? <Loader2 className="h-4 w-4 animate-spin" /> : "บันทึก"}
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit}>
                ยกเลิก
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingSchool(true)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              {school ? `โรงเรียน: ${school}` : "เพิ่มชื่อโรงเรียน"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
