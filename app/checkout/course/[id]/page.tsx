import { CourseCheckoutClient } from "@/features/checkout/course-checkout-client"

export const metadata = {
  title: "ยืนยันการสั่งซื้อคอร์ส | เคมีพี่ต้า",
}

type PageProps = { params: Promise<{ id: string }> }

export default async function CheckoutCoursePage({ params }: PageProps) {
  const { id } = await params
  return <CourseCheckoutClient id={id} />
}
