import { EbookCheckoutClient } from "@/features/checkout/ebook-checkout-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ยืนยันการสั่งซื้อหนังสือ"),
}

type PageProps = { params: Promise<{ id: string }> }

export default async function CheckoutEbookPage({ params }: PageProps) {
  const { id } = await params
  return <EbookCheckoutClient id={id} />
}
