import { useEffect, useState } from "react"
import { postUploadSlip } from "@/features/order-success/api/upload-slip"
import { shippingAddressSchema, type ShippingAddress } from "@/lib/schemas/shipping-address.schema"
import type { NormalizedShipping, Order } from "@/features/order-success/types"

const EMPTY_SHIPPING: ShippingAddress = {
  name: "",
  phone: "",
  address: "",
  district: "",
  province: "",
  postalCode: "",
}

type ValidateSchoolResult = { ok: true; value: string | undefined } | { ok: false; error: string }

export function useSlipUpload({
  order,
  normalizedShipping,
  refreshOrder,
  validateSchool,
  onSchoolSaved,
}: {
  order: Order | null
  normalizedShipping: NormalizedShipping | null
  refreshOrder: () => Promise<void>
  validateSchool: () => ValidateSchoolResult
  onSchoolSaved: (value: string) => void
}) {
  const [openUpload, setOpenUpload] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)
  const [shipping, setShipping] = useState<ShippingAddress>(EMPTY_SHIPPING)

  useEffect(() => {
    const s = normalizedShipping || EMPTY_SHIPPING
    setShipping({ ...s })
  }, [order?.id, normalizedShipping])

  useEffect(() => {
    if (!file) {
      if (filePreview) {
        try {
          URL.revokeObjectURL(filePreview)
        } catch {}
      }
      setFilePreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setFilePreview(url)
    return () => {
      try {
        URL.revokeObjectURL(url)
      } catch {}
    }
  }, [file])

  const uploadSlip = async () => {
    if (!order || !file) return
    const schoolCheck = validateSchool()
    if (!schoolCheck.ok) {
      setUploadMsg(schoolCheck.error)
      return
    }
    if (!normalizedShipping) {
      const validation = shippingAddressSchema.safeParse(shipping)
      if (!validation.success) {
        setUploadMsg(validation.error.issues[0]?.message ?? "ข้อมูลจัดส่งไม่ถูกต้อง")
        return
      }
    }
    try {
      setUploading(true)
      setUploadMsg(null)
      const form = new FormData()
      form.append("orderId", order.id)
      form.append("file", file)
      if (schoolCheck.value) form.append("school", schoolCheck.value)
      if (!normalizedShipping) {
        form.append("shippingName", shipping.name)
        form.append("shippingPhone", shipping.phone)
        form.append("shippingAddress", shipping.address)
        form.append("shippingDistrict", shipping.district)
        form.append("shippingProvince", shipping.province)
        form.append("shippingPostalCode", shipping.postalCode)
      }
      await postUploadSlip(form)

      if (schoolCheck.value) onSchoolSaved(schoolCheck.value)
      setUploadMsg("อัพโหลดสลิปสำเร็จ กำลังรอตรวจสอบ…")
      setOpenUpload(false)
      setFile(null)
      await refreshOrder()
    } catch (e: any) {
      setUploadMsg(e?.message ?? "อัพโหลดไม่สำเร็จ")
    } finally {
      setUploading(false)
    }
  }

  return {
    openUpload,
    setOpenUpload,
    file,
    setFile,
    filePreview,
    uploading,
    uploadMsg,
    shipping,
    setShipping,
    uploadSlip,
  }
}
