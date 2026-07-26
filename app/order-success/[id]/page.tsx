import { OrderSuccessClient } from "@/features/order-success/order-success-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ยืนยันการสั่งซื้อ"),
}

type PageProps = { params: Promise<{ id: string }> }

export default async function OrderSuccessPage({ params }: PageProps) {
  const { id } = await params
  return <OrderSuccessClient id={id} />
}
