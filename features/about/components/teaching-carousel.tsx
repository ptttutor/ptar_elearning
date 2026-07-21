"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { TeachingImage } from "@/features/about/types"

export function TeachingCarousel({ images }: { images: TeachingImage[] }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)

  return (
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
                <Image src={images[currentImageIndex]?.src || "/placeholder.svg"} alt={images[currentImageIndex]?.alt || ""} fill className="object-cover transition-all duration-500 " />

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
                  <h3 className="text-white text-xl font-semibold">{images[currentImageIndex]?.title}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-6 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
