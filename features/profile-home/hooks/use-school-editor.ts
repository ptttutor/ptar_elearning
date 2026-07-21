import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import http from "@/lib/http"

/** Inline "edit my school" on the profile page — separate from hooks/use-school-field.ts,
 *  which captures the school once at checkout time rather than editing/persisting it directly. */
export function useSchoolEditor() {
  const { user, isAuthenticated, updateUser } = useAuth()
  const { toast } = useToast()
  const [editingSchool, setEditingSchool] = useState(false)
  const [school, setSchool] = useState("")
  const [savingSchool, setSavingSchool] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    setSchool((user as any)?.school || "")
    ;(async () => {
      try {
        const res = await http.get("/api/users/me")
        if (res.data?.success) {
          setSchool(res.data.data.school || "")
          updateUser({ ...(user as any), school: res.data.data.school || "" })
        }
      } catch {}
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const saveSchool = async () => {
    setSavingSchool(true)
    try {
      const res = await http.patch("/api/users/me", { school })
      if (res.data?.success) {
        updateUser({ ...(user as any), school: res.data.data.school || "" })
        setEditingSchool(false)
        toast({ title: "บันทึกข้อมูลโรงเรียนสำเร็จ" })
      } else {
        toast({ variant: "destructive", title: res.data?.error || "บันทึกไม่สำเร็จ" })
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: e?.response?.data?.error || "บันทึกไม่สำเร็จ" })
    } finally {
      setSavingSchool(false)
    }
  }

  const cancelEdit = () => {
    setEditingSchool(false)
    setSchool((user as any)?.school || "")
  }

  return { editingSchool, setEditingSchool, school, setSchool, savingSchool, saveSchool, cancelEdit }
}
