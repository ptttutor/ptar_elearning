import http from "@/lib/http"

export async function uploadSlip(orderId: string, file: File, onProgress: (percent: number) => void): Promise<void> {
  const form = new FormData()
  form.append("orderId", orderId)
  form.append("file", file)
  const res = await http.post(`/api/payments/upload-slip`, form, {
    onUploadProgress: (evt) => {
      if (evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total))
    },
  })
  const json = res.data || {}
  if (res.status < 200 || res.status >= 300 || json?.success === false) {
    throw new Error(json?.error || "อัพโหลดไม่สำเร็จ")
  }
}
