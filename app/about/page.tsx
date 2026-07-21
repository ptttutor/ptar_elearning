import { AboutClient } from "@/features/about/about-client"
import { fetchTeachingImages } from "@/features/about/api/fetch-teaching-images"

export const metadata = {
  title: "เกี่ยวกับเรา | เคมีพี่ต้า",
  description: "โรงเรียนกวดวิชาเคมี ต้าเคมีพี่ต้า ประวัติและประสบการณ์การสอน บรรยากาศการเรียนการสอน",
}

export default async function AboutPage() {
  const images = await fetchTeachingImages()
  return <AboutClient images={images} />
}
