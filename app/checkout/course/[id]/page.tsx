import { CourseCheckoutClient } from "@/features/checkout/course-checkout-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ยืนยันการสั่งซื้อคอร์ส"),
}

type PageProps = { params: Promise<{ id: string }> }

export default async function CheckoutCoursePage({ params }: PageProps) {
  const { id } = await params
  return <CourseCheckoutClient id={id} />
}
