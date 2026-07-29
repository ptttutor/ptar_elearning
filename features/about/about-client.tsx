"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Award, Target } from "lucide-react"
import { siteConfig } from "@/lib/site-config"

const achievements = [
  "Fullstack Developer ที่ Waylar Corporation พัฒนาและดูแลแพลตฟอร์มโลจิสติกส์ WAYLAR WORK และ WAYLAR CONNECT",
  "Fullstack Developer ที่ Inspiring Group พัฒนาและดูแลระบบ KLIK Booking",
  "ปริญญาตรี วิทยาการคอมพิวเตอร์ คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยเจ้าพระยา",
  "สร้างแพลตฟอร์ม White-Label E-Learning และร้านค้า Shopify ให้ธุรกิจที่ต้องการเว็บไซต์คุณภาพ",
]

const currentPositions = ["ผู้ก่อตั้งและ Lead Developer ที่ tawan.dev"]

export function AboutClient() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-accent to-background">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="pt-12 md:pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 lg:mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">เกี่ยวกับเรา</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{siteConfig.fullName}</p>
            <p className="text-lg text-muted-foreground/80 mt-2">{siteConfig.subtitle}</p>
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="py-5 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative max-w-sm mx-auto md:max-w-none bg-gradient-to-br from-primary/10 to-accent rounded-[2rem] shadow-2xl p-6 md:p-10">
                <Image src="/tawan-about.png" alt={siteConfig.siteName} width={900} height={900} sizes="(min-width: 468px) 50vw, 100vw" className="w-full h-auto object-contain" priority />
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Tawan Chankachang</h2>
                <p className="text-xl text-muted-foreground mb-4">Founder &amp; Lead Developer, {siteConfig.siteName}</p>
                <Badge variant="outline" className="text-primary border-primary">
                  Bangkok, Thailand
                </Badge>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  ประวัติ / ประสบการณ์ทำงาน
                </h3>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 * index }} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <p className="text-muted-foreground leading-relaxed">{achievement}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  ปัจจุบัน
                </h3>
                <div className="space-y-3">
                  {currentPositions.map((position, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 + 0.1 * index }} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <p className="text-muted-foreground leading-relaxed">{position}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4 md:px-6 bg-gradient-to-r from-primary to-primary/90"
      >
        <div className="max-w-7xl mx-auto">
          <h3 className="text-center text-primary-foreground text-xl sm:text-2xl font-bold mb-6 sm:mb-8">
            เทคโนโลยีที่ใช้
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Express", "PostgreSQL", "Prisma"].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm font-medium"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </motion.section>
    </main>
  )
}
