import { AboutClient } from "@/features/about/about-client"
import { fetchTeachingImages } from "@/features/about/api/fetch-teaching-images"
import { siteConfig, pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("เกี่ยวกับเรา"),
  description: `${siteConfig.fullName} ประวัติและประสบการณ์การสอน บรรยากาศการเรียนการสอน`,
}

export default async function AboutPage() {
  const images = await fetchTeachingImages()
  return <AboutClient images={images} />
}
