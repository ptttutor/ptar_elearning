import type React from "react"
import type { Metadata } from "next"
import { Sarabun } from "next/font/google"
import "./globals.css"
import { SiteChrome } from "@/components/site-chrome"

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: "เคมีพี่ต้า โรงเรียนกวดวิชาเคมี",
  description: "โรงเรียนกวดวิชาเคมีพี่ต้า ",
  keywords: "โรงเรียนกวดวิชาเคมีพี่ต้า",
  generator: "Demo-Learning.app",
  icons: {
    icon: "/new-logo.png",
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
