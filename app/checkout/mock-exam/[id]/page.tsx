import { MockExamCheckoutClient } from "@/features/checkout/mock-exam-checkout-client"

export const metadata = {
  title: "ยืนยันการสั่งซื้อข้อสอบจำลอง | เคมีพี่ต้า",
}

type PageProps = { params: Promise<{ id: string }> }

export default async function CheckoutMockExamPage({ params }: PageProps) {
  const { id } = await params
  return <MockExamCheckoutClient id={id} />
}
