"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import http from "@/lib/http"

// Shared "โรงเรียน" collection: once a user has it saved, every checkout/
// payment step just displays it — never asks twice. See order-success and
// the checkout/{course,ebook,cart} pages for usage.
export function useSchoolField() {
  const { user, isAuthenticated, updateUser } = useAuth()
  const [school, setSchool] = useState<string>((user as any)?.school || "")
  const [schoolInput, setSchoolInput] = useState("")

  useEffect(() => {
    if (!isAuthenticated) return
    let active = true
    ;(async () => {
      try {
        const res = await http.get("/api/users/me")
        if (active && res.data?.success && res.data.data?.school) {
          setSchool(res.data.data.school)
          updateUser({ ...(user as any), school: res.data.data.school })
        }
      } catch {}
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Validates the pending input (when school isn't already on file) and,
  // if valid, returns the value to send along with the create/upload call —
  // callers persist it themselves (order create / upload-slip) so it's saved
  // atomically with that request instead of a separate round-trip.
  function validateSchool(): { ok: true; value: string | undefined } | { ok: false; error: string } {
    if (school) return { ok: true, value: undefined }
    if (!schoolInput.trim()) return { ok: false, error: "กรุณากรอกชื่อโรงเรียน" }
    return { ok: true, value: schoolInput.trim() }
  }

  function onSaved(savedSchool: string) {
    setSchool(savedSchool)
    updateUser({ ...(user as any), school: savedSchool })
  }

  return { school, schoolInput, setSchoolInput, validateSchool, onSaved }
}
