import { AboutClient } from "@/features/about/about-client"
import { siteConfig, pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("เกี่ยวกับเรา"),
  description: `${siteConfig.fullName} ประวัติและประสบการณ์การทำงาน`,
}

export default async function AboutPage() {
  return <AboutClient />
}
