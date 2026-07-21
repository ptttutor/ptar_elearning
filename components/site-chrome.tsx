"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/sections/footer"
import { AuthProvider } from "@/components/auth-provider"
import { CartProvider } from "@/components/cart-provider"
import { Toaster } from "@/components/ui/toaster"

// The admin panel has its own auth (NextAuth), header, and layout — it must
// not be wrapped in the customer AuthProvider/CartProvider/Navigation, or
// the two independent login systems run their effects on top of each other
// (customer session-recovery, cart fetches, etc. firing on admin pages).
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Navigation />
        <main className="pt-16 lg:pt-20">{children}</main>
        <Footer />
        <Toaster />
      </CartProvider>
    </AuthProvider>
  )
}
