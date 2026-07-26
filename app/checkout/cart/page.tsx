import { CheckoutCartClient } from "@/features/checkout/checkout-cart-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ยืนยันคำสั่งซื้อ"),
}

export default function CheckoutCartPage() {
  return <CheckoutCartClient />
}
