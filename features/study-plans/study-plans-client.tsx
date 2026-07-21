"use client"

import { MotionConfig, motion } from "framer-motion"
import Link from "next/link"
import { ElegantStack, type GalleryImage } from "@/components/elegant-image-stack"

export function StudyPlansClient({ items }: { items: GalleryImage[] }) {
  return (
    <MotionConfig transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
      <main className="min-h-screen bg-background flex flex-col">
        <section className="relative">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-accent via-accent/40 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-accent via-accent/40 to-transparent" />
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(1200px 400px at 50% -200px, hsl(var(--primary) / 0.15), transparent 60%)" }}
            />
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: "repeating-linear-gradient(90deg, hsl(var(--border)) 0, hsl(var(--border)) 1px, transparent 1px, transparent 48px)" }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
            <ElegantStack items={items} />
          </div>
        </section>

        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="py-16 bg-primary mt-auto">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">คุณก็สามารถเป็นส่วนหนึ่งของความสำเร็จได้</h2>
            <p className="text-lg text-primary-foreground/80 mb-8">เริ่มต้นการเรียนรู้ฟิสิกส์กับเราวันนี้</p>
            <Link href="/courses" className="inline-block bg-background text-foreground px-8 py-3 rounded-full font-semibold hover:bg-accent transition-colors duration-300">
              สมัครเรียนเลย
            </Link>
          </div>
        </motion.section>
      </main>
    </MotionConfig>
  )
}
