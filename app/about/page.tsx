"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Award, Users, BookOpen, Target } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"

const teachingEnvironmentImages = [
  {
    id: 1,
    src: "/placeholder.svg",
    alt: "บรรยากาศการเรียนในห้องเรียน",
    title: "บรรยากาศการเรียนในห้องเรียน",
  },
  {
    id: 2,
    src: "/placeholder.svg",
    alt: "บรรยากาศการเรียนในห้องเรียน",
    title: "บรรยากาศการเรียนในห้องเรียน",
  },
  {
    id: 3,
    src: "/placeholder.svg",
    alt: "บรรยากาศการเรียนในห้องเรียน",
    title: "บรรยากาศการเรียนในห้องเรียน",
  },
]

const achievements = [
  "วิทยาศาสตร์เคมี ทุน พสวท. มหาวิทยาลัยขอนแก่น",
  "ประสบการณ์สอน 15 ปี มากกว่า 100 โรงเรียน",
  "ลูกศิษย์สอบติดโอลิมปิกวิชาการ เคมี สอวน.เคมี",
  "ลูกศิษย์สอบติดมหาวิทยาลัยชั้นนำปีละ หลายร้อยคน",
]

const currentPositions = ["อาจารย์พิเศษห้องเรียนพิเศษทั่วประเทศ"]

export default function AboutPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [images, setImages] = useState(teachingEnvironmentImages)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const params = new URLSearchParams({ postType: "บรรยากาศการเรียน", limit: "20" })
          const res = await fetch(`/api/posts?${params.toString()}`, { cache: "no-store" })
          if (res.ok) {
            console.log("[About] Fetch /api/posts: OK", res.status)
          } else {
            console.warn("[About] Fetch /api/posts: NOT OK", res.status, res.statusText)
          }
          const json: any = await res.json().catch(() => null)

          const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []
          if (!list.length) {
            console.warn(
              `[About] API ไม่มีข้อมูลโพสต์ ใช้รูป dummy แทน (${teachingEnvironmentImages.length} ภาพ)`
            )
            return
          } else {
            console.log(`[About] Posts loaded: ${list.length}`)
          }

          const mapped = list
            .map((p: any, idx: number) => ({
              id: p?.id ?? idx,
              src: p?.imageUrl || p?.imageUrlMobileMode || "",
              alt: p?.title || "บรรยากาศการเรียน",
              title: p?.title || "บรรยากาศการเรียน",
            }))
            .filter((s: { id: string | number; src: string }) => !!s.src)

          console.log(`[About] Slides mapped: ${mapped.length}`)

          if (mounted && mapped.length) {
            setImages(mapped as any)
            setCurrentImageIndex(0)
            console.log(`[About] ใช้รูปจาก API จำนวน ${mapped.length} ภาพ`)
          } else if (mounted) {
            console.warn(
              `[About] API ไม่มีรูป (imageUrl/imageUrlMobileMode) ใช้รูป dummy แทน (${teachingEnvironmentImages.length} ภาพ)`
            )
          }
        } catch (err) {
          console.error("[About] Failed to load posts", err)
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-accent to-background">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-12 md:pt-24 px-4"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-4 lg:mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">เกี่ยวกับเรา</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">โรงเรียนกวดวิชาเคมี ต้าเคมีพี่ต้า</p>
              <p className="text-lg text-muted-foreground/80 mt-2">(ในความควบคุมของกระทรวงศึกษาธิการ)</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="py-5 px-4"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="relative max-w-[250px] mx-auto rounded-2xl overflow-hidden shadow-2xl md:max-w-none md:w-full md:h-190">
                  <Image
                    src="/profile_about.png"
                    alt="ต้าเคมีพี่ต้า"
                    width={1200}
                    height={1500}
                    sizes="(min-width: 468px) 50vw, 100vw"
                    className="w-full h-auto md:h-full md:object-cover"
                    priority
                  />
                </div>

                <div className="absolute -bottom-4 right-12 md:-bottom-6 md:-right-6 bg-primary text-primary-foreground p-3 md:p-4 rounded-2xl shadow-lg">
                  <Award className="h-6 w-6 md:h-8 md:w-8" />
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">เคมี พี่ต้า</h2>
                  <p className="text-xl text-muted-foreground mb-4">ต้าเคมีพี่ต้า</p>
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
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="flex items-start gap-3"
                      >
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
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + 0.1 * index }}
                        className="flex items-start gap-3"
                      >
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
          transition={{ duration: 0.8, delay: 0.4 }}
          className="py-16 px-4 bg-none"
        >
          <div className="max-w-7xl mx-auto ">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">บรรยากาศการสอน</h2>
              <p className="text-xl text-muted-foreground">สภาพแวดล้อมการเรียนรู้ที่เอื้อต่อการพัฒนาศักยภาพ</p>
            </div>

            <div className="relative">
              <Card className="overflow-hidden shadow-2xl p-0">
                <CardContent className="p-0 ">
                  <div className="relative h-96 md:h-[500px]">
                    <Image
                      src={images[currentImageIndex]?.src || "/placeholder.svg"}
                      alt={images[currentImageIndex]?.alt || ""}
                      fill
                      className="object-cover transition-all duration-500 "
                    />

                    <Button
                      onClick={prevImage}
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/90 hover:bg-background shadow-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={nextImage}
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/90 hover:bg-background shadow-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      <h3 className="text-white text-xl font-semibold">
                        {images[currentImageIndex]?.title}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center mt-6 gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                  />
                ))}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 text-center">
              <div className="text-primary-foreground">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 md:mb-4" />
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">100+</h3>
                <p className="text-sm sm:text-base md:text-lg leading-snug">
                  โรงเรียนที่เข้าสอน
                </p>
              </div>

              <div className="text-primary-foreground">
                <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 md:mb-4" />
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">15+</h3>
                <p className="text-sm sm:text-base md:text-lg leading-snug">
                  ปีของประสบการณ์การสอน
                </p>
              </div>

              <div className="text-primary-foreground">
                <Award className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 md:mb-4" />
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">หลายร้อย</h3>
                <p className="text-sm sm:text-base md:text-lg leading-snug">
                  ลูกศิษย์ติดมหาวิทยาลัยชั้นนำ
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </>
  )
}