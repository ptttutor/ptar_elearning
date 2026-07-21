import { z } from "zod"

const REQUIRED_FIELDS = ["name", "phone", "address", "district", "province", "postalCode"] as const

export const shippingAddressSchema = z
  .object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    district: z.string(),
    province: z.string(),
    postalCode: z.string(),
  })
  .superRefine((value, ctx) => {
    const missing = REQUIRED_FIELDS.filter((field) => !value[field]?.trim())
    if (missing.length > 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "กรุณากรอกข้อมูลจัดส่งให้ครบถ้วน" })
      return
    }
    const phoneDigits = value.phone.replace(/\D/g, "")
    if (phoneDigits.length !== 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "กรุณากรอกเบอร์โทร 10 หลัก" })
      return
    }
    const postalDigits = value.postalCode.replace(/\D/g, "")
    if (postalDigits.length !== 5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "กรุณากรอกรหัสไปรษณีย์ 5 หลัก" })
    }
  })
