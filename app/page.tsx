import { HomeClient } from "@/features/home/home-client"
import { siteConfig } from "@/lib/site-config"

export const metadata = {
  title: `${siteConfig.siteName} ${siteConfig.fullName}`,
  description: siteConfig.defaultDescription,
}

export default function HomePage() {
  return <HomeClient />
}
