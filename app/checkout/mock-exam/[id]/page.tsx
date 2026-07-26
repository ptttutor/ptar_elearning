import { MockExamCheckoutClient } from "@/features/checkout/mock-exam-checkout-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ยืนยันการสั่งซื้อข้อสอบจำลอง"),
}

type PageProps = { params: Promise<{ id: string }> }

export default async function CheckoutMockExamPage({ params }: PageProps) {
  const { id } = await params
  return <MockExamCheckoutClient id={id} />
}
