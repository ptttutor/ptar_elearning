import { FlashcardCheckoutClient } from "@/features/checkout/flashcard-checkout-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ยืนยันการสั่งซื้อชุดแฟลชการ์ด"),
}

type PageProps = { params: Promise<{ id: string }> }

export default async function CheckoutFlashcardPage({ params }: PageProps) {
  const { id } = await params
  return <FlashcardCheckoutClient id={id} />
}
