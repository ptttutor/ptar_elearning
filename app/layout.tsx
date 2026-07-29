import type React from "react"
import type { Metadata } from "next"
import { Sarabun } from "next/font/google"
import "./globals.css"
import { SiteChrome } from "@/components/site-chrome"
import { siteConfig } from "@/lib/site-config"

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: `${siteConfig.siteName} ${siteConfig.fullName}`,
  description: siteConfig.fullName,
  keywords: siteConfig.keywords,
  generator: "Demo-Learning.app",
  icons: {
    icon: siteConfig.logo,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`font-sans ${sarabun.variable} antialiased`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
