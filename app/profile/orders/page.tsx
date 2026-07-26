import { OrdersPageClient } from "@/features/profile-orders/orders-page-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("คำสั่งซื้อของฉัน"),
}

export default function OrdersPage() {
  return <OrdersPageClient />
}
