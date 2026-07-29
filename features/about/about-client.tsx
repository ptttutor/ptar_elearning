"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Award, Users, BookOpen, Target } from "lucide-react"
import { TeachingCarousel } from "@/features/about/components/teaching-carousel"
import type { TeachingImage } from "@/features/about/types"
import { siteConfig } from "@/lib/site-config"

const achievements = [
  "วิทยาศาสตร์เคมี ทุน พสวท. มหาวิทยาลัยขอนแก่น",
  "ประสบการณ์สอน 15 ปี มากกว่า 100 โรงเรียน",
  "ลูกศิษย์สอบติดโอลิมปิกวิชาการ เคมี สอวน.เคมี",
  "ลูกศิษย์สอบติดมหาวิทยาลัยชั้นนำปีละ หลายร้อยคน",
]

const currentPositions = ["อาจารย์พิเศษห้องเรียนพิเศษทั่วประเทศ"]

export function AboutClient({ images }: { images: TeachingImage[] }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-accent to-background">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="pt-12 md:pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 lg:mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">เกี่ยวกับเรา</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{siteConfig.fullName}</p>
            <p className="text-lg text-muted-foreground/80 mt-2">(ในความควบคุมของกระทรวงศึกษาธิการ)</p>
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="py-5 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative max-w-[250px] mx-auto rounded-2xl overflow-hidden shadow-2xl md:max-w-none md:w-full md:h-190">
                <Image src="/profile_about.png" alt={siteConfig.siteName} width={1200} height={1500} sizes="(min-width: 468px) 50vw, 100vw" className="w-full h-auto md:h-full md:object-cover" priority />
              </div>

              <div className="absolute -bottom-4 right-12 md:-bottom-6 md:-right-6 bg-primary text-primary-foreground p-3 md:p-4 rounded-2xl shadow-lg">
                <Award className="h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">เคมี พี่ต้า</h2>
                <p className="text-xl text-muted-foreground mb-4">{siteConfig.siteName}</p>
                <Badge variant="outline" className="text-primary border-primary">
                  ผู้เชี่ยวชาญด้านเคมี
                </Badge>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  ประวัติ / ประสบการณ์การสอน
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

      <TeachingCarousel images={images} />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4 md:px-6 bg-gradient-to-r from-primary to-primary/90"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 text-center">
            <div className="text-primary-foreground">
              <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 md:mb-4" />
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">100+</h3>
              <p className="text-sm sm:text-base md:text-lg leading-snug">โรงเรียนที่เข้าสอน</p>
            </div>

            <div className="text-primary-foreground">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 md:mb-4" />
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">15+</h3>
              <p className="text-sm sm:text-base md:text-lg leading-snug">ปีของประสบการณ์การสอน</p>
            </div>

            <div className="text-primary-foreground">
              <Award className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 md:mb-4" />
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">หลายร้อย</h3>
              <p className="text-sm sm:text-base md:text-lg leading-snug">ลูกศิษย์ติดมหาวิทยาลัยชั้นนำ</p>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
