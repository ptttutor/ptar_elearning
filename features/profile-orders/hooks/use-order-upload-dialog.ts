import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { uploadSlip } from "@/features/profile-orders/api/upload-slip"
import type { Order } from "@/features/profile-orders/types"

export function useOrderUploadDialog(onUploaded: () => void) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const openFor = (order: Order) => {
    setSelectedOrder(order)
    setFile(null)
    setUploadError(null)
    setUploadSuccess(null)
    setOpen(true)
  }

  const submit = async () => {
    if (!selectedOrder || !file) return
    try {
      setUploading(true)
      setUploadError(null)
      setUploadSuccess(null)
      setUploadProgress(0)
      await uploadSlip(selectedOrder.id, file, setUploadProgress)
      setUploadSuccess("อัพโหลดสลิปสำเร็จ กำลังรอตรวจสอบ")
      toast({ title: "อัพโหลดสลิปสำเร็จ", description: "กำลังรอตรวจสอบ" })
      onUploaded()
    } catch (e: any) {
      setUploadError(e?.message ?? "อัพโหลดไม่สำเร็จ")
      toast({ title: "อัพโหลดสลิปไม่สำเร็จ", description: e?.message ?? "ลองใหม่อีกครั้ง", variant: "destructive" as any })
    } finally {
      setUploading(false)
    }
  }

  return {
    open,
    setOpen,
    selectedOrder,
    file,
    setFile,
    uploading,
    uploadProgress,
    uploadError,
    uploadSuccess,
    openFor,
    submit,
  }
}
