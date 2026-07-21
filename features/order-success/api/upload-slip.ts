import { authHeaders } from "@/lib/auth-headers"

export async function postUploadSlip(form: FormData): Promise<void> {
  const res = await fetch(`/api/payments/upload-slip`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  })
  const text = await res.text().catch(() => "")
  let json: any = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {}
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || (text && text.slice(0, 300)) || `HTTP ${res.status}`)
  }
}
