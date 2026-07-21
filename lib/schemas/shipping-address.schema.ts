import { z } from "zod"

/**
 * Shared shipping-address validation for every flow that can ship a
 * physical item: the cart page, and all four checkout confirmation pages
 * (cart, course, ebook — mock exams are never physical). One schema, one
 * set of error messages, instead of four near-identical hand-rolled
 * if-chains with slightly different wording.
 */

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

export type ShippingAddress = z.infer<typeof shippingAddressSchema>
