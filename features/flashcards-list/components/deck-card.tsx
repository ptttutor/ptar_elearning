"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Layers, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getSubjectLabel, getGradeLevelLabel } from "@/lib/constants"
import type { ApiFlashcardDeck } from "@/features/flashcards-list/types"

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }

function effectivePrice(deck: ApiFlashcardDeck) {
  return deck.discountPrice != null && deck.discountPrice < deck.price ? deck.discountPrice : deck.price
}

export function DeckCard({ deck }: { deck: ApiFlashcardDeck }) {
  // A priced deck the user hasn't bought goes to checkout instead of study.
  const locked = deck.price > 0 && !deck.hasAccess
  return (
    <motion.div variants={fadeInUp}>
      <Link href={locked ? `/checkout/flashcard/${deck.id}` : `/flashcards/${deck.id}`} className="block h-full">
        <Card className="h-full hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
          <CardContent className="p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">{getSubjectLabel(deck.subject)}</Badge>
              {deck.gradeLevel && <Badge variant="outline">{getGradeLevelLabel(deck.gradeLevel)}</Badge>}
              {deck.topic && (
                <Badge variant="outline" className="border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700">
                  {deck.topic.name}
                </Badge>
              )}
            </div>

            <h3 className="text-xl font-bold text-card-foreground mb-2 text-balance line-clamp-2">{deck.title}</h3>
            {deck.description && <p className="text-muted-foreground mb-4 text-pretty line-clamp-2">{deck.description}</p>}

            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
              <Layers className="h-4 w-4" />
              <span>{deck.totalCards} ใบ</span>
            </div>

            {locked ? (
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  <Lock className="mr-1 h-3 w-3" />
                  ซื้อเพื่อเริ่มเรียน
                </Badge>
                <div className="text-right">
                  <span className="text-lg font-bold text-foreground">฿{effectivePrice(deck).toLocaleString()}</span>
                  {effectivePrice(deck) < deck.price && (
                    <span className="ml-1.5 text-sm text-muted-foreground line-through">฿{deck.price.toLocaleString()}</span>
                  )}
                </div>
              </div>
            ) : (
            <div className="flex flex-wrap items-center gap-2">
              {deck.price > 0 && (
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                  ซื้อแล้ว
                </Badge>
              )}
              {deck.dueCount > 0 ? (
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                  ถึงกำหนดทบทวน {deck.dueCount} ใบ
                </Badge>
              ) : (
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-500">
                  ไม่มีการ์ดค้างทบทวน
                </Badge>
              )}
              {deck.newCount > 0 && (
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                  ใหม่ {deck.newCount} ใบ
                </Badge>
              )}
            </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
