import { OrderSuccessClient } from "@/features/order-success/order-success-client"

export const metadata = {
  title: "ยืนยันการสั่งซื้อ | เคมีพี่ต้า",
}

type PageProps = { params: Promise<{ id: string }> }

export default async function OrderSuccessPage({ params }: PageProps) {
  const { id } = await params
  return <OrderSuccessClient id={id} />
}
