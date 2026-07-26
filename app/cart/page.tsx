import { CartClient } from "@/features/cart/cart-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ตะกร้าสินค้า"),
}

export default function CartPage() {
  return <CartClient />
}
