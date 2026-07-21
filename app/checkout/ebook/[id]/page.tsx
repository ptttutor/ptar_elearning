import { EbookCheckoutClient } from "@/features/checkout/ebook-checkout-client"

export const metadata = {
  title: "ยืนยันการสั่งซื้อหนังสือ | เคมีพี่ต้า",
}

type PageProps = { params: Promise<{ id: string }> }

export default async function CheckoutEbookPage({ params }: PageProps) {
  const { id } = await params
  return <EbookCheckoutClient id={id} />
}
