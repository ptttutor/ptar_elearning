"use client"

import type { ReactNode } from "react"
import { useMemo } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

export type GalleryImage = {
  id: string | number
  imageDesktop: string
  imageMobile: string
}

export function TileFrame({ children }: { children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="relative rounded-2xl overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.07)] ring-1 ring-border bg-card/80"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="relative w-full aspect-[283/400] sm:aspect-[283/400] md:aspect-[283/400]">
        <div className="absolute inset-0">{children}</div>
      </div>
    </motion.div>
  )
}

function ElegantTile({ work, index }: { work: GalleryImage; index: number }) {
  const variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 18, scale: 0.992, filter: "blur(4px)" },
      show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.55 } },
    }),
    []
  )

  return (
    <motion.figure variants={variants}>
      <TileFrame>
        {work.imageDesktop && (
          <Image src={work.imageDesktop} alt="" fill sizes="(min-width: 768px) 100vw, 0px" className="object-cover hidden md:block" fetchPriority={index < 1 ? "high" : undefined} />
        )}
        {work.imageMobile && (
          <Image src={work.imageMobile} alt="" fill sizes="(max-width: 767px) 100vw, 0px" className="object-cover md:hidden" fetchPriority={index < 1 ? "high" : undefined} />
        )}
      </TileFrame>
    </motion.figure>
  )
}

export function ElegantStack({ items }: { items: GalleryImage[] }) {
  return (
    <motion.div
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.01 }}
      variants={{ hidden: { opacity: 1 }, show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.04 } } }}
      className="mx-auto max-w-3xl space-y-8 sm:space-y-10"
    >
      {items.map((work, i) => (
        <ElegantTile key={work.id} work={work} index={i} />
      ))}
    </motion.div>
  )
}
