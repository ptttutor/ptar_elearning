"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import http from "@/lib/http"

type ArticleItem = {
  id: string | number
  slug: string
  title: string
  excerpt: string
  date: string
  imageDesktop: string
  imageMobile: string
}

function deriveExcerpt(input?: string, max = 160) {
  if (!input) return ""
  const text = String(input)
    .replace(/\r\n|\n|\r/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > max ? text.slice(0, max - 1) + "…" : text
}

export default function Articles() {
  const [items, setItems] = useState<ArticleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const params = new URLSearchParams({ postType: "บทความ", featured: "true", limit: "12" })
          const res = await http.get(`/api/posts?${params.toString()}`)
          if (!mounted) return

          if (res.status < 200 || res.status >= 300) {
            console.warn("[ArticlesSection] Fetch /api/posts: NOT OK", res.status, res.statusText)
            setItems([])
            return
          }

          const json: any = res.data || null
          const list: any[] = Array.isArray(json)
            ? json
            : Array.isArray(json?.data)
              ? json.data
              : []


          const filtered = list.filter((p) => p?.postType?.name === "บทความ" && p?.isFeatured === true)

          if (!filtered.length) {
            setItems([])
            return
          }

          const mapped: ArticleItem[] = filtered
            .map((p: any, idx: number) => {
              const desktop = p?.imageUrl || p?.imageUrlMobileMode || ""
              const mobile = p?.imageUrlMobileMode || p?.imageUrl || ""
              const excerpt = p?.excerpt || deriveExcerpt(p?.content, 180)
              const dateIso = p?.publishedAt
                ? new Date(p.publishedAt).toISOString()
                : new Date().toISOString()
              return {
                id: p?.id ?? idx,
                slug: p?.slug || "",
                title: p?.title || "",
                imageDesktop: desktop,
                imageMobile: mobile,
                excerpt: excerpt || "",
                date: dateIso,
              }
            })
            .filter((a) => !!(a.imageDesktop || a.imageMobile))

          setItems(mapped)
        } catch (err) {
          console.error("[ArticlesSection] Failed to load posts", err)
          if (mounted) setItems([])
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="pt-0 pb-10 lg:pt-24 lg:pb-5 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="text-center mb-5">
          <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-4 text-balance bg-primary text-primary-foreground px-8 py-4 w-fit mx-auto rounded-full shadow-sm">
            บทความแนะนำ
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            บทความและเทคนิคการเรียนรู้ที่จะช่วยให้คุณเข้าใจและพัฒนาทักษะได้ดีขึ้น
          </p>
        </div>


        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="overflow-hidden bg-card pt-0 border-border">
                <CardContent className="p-0">
                  <div className="aspect-[16/7.5] relative overflow-hidden">
                    <div className="absolute inset-0 shimmer rounded-b-none" />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-40 shimmer rounded" />
                    <div className="h-6 w-3/4 shimmer rounded" />
                    <div className="h-4 w-full shimmer rounded" />
                    <div className="h-4 w-5/6 shimmer rounded" />
                    <div className="h-4 w-2/3 shimmer rounded" />
                    <div className="h-10 w-28 shimmer rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">ยังไม่มีบทความในขณะนี้</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((article) => (
                <Card
                  key={article.id}
                  className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-card pt-0 border-border"
                >
                  <CardContent className="p-0">
                    <Link href={article.slug ? `/articles/${article.slug}` : `#`}>
                      <div className="aspect-[16/7.5] relative overflow-hidden cursor-pointer">
                        {article.imageDesktop && (
                          <Image
                            src={article.imageDesktop}
                            alt={article.title}
                            fill
                            sizes="(min-width: 768px) 100vw, 0px"
                            className="object-contain hidden md:block group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        {article.imageMobile && (
                          <Image
                            src={article.imageMobile}
                            alt={article.title}
                            fill
                            sizes="(max-width: 767px) 100vw, 0px"
                            className="object-contain md:hidden group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    </Link>

                    <div className="p-6">
                      <div className="flex items-center text-sm text-muted-foreground mb-3 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(article.date).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      <Link href={article.slug ? `/articles/${article.slug}` : `#`}>
                        <h3 className="text-xl font-semibold text-card-foreground mb-3 text-balance group-hover:text-primary transition-colors duration-200 cursor-pointer">
                          {article.title}
                        </h3>
                      </Link>

                      <p className="text-muted-foreground mb-6 text-pretty leading-relaxed">
                        {article.excerpt}
                      </p>

                      <Button
                        asChild
                        variant="ghost"
                        className="group/btn p-0 h-auto text-primary hover:text-primary/80"
                      >
                        <Link href={article.slug ? `/articles/${article.slug}` : `#`}>
                          อ่านต่อ
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 bg-transparent"
              >
                <Link href="/articles">ดูบทความเพิ่มเติม</Link>
              </Button>
            </div>

            <div className="mt-16 bg-muted rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">ติดตามบทความใหม่ๆ</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                รับบทความและเทคนิคการเรียนรู้ใหม่ๆ ส่งตรงถึงอีเมลของคุณ
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-12"
                />
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-12 whitespace-nowrap">
                  สมัครรับข่าวสาร
                </Button>
              </div>
            </div>
          </>
        )}
      </div>


      <style jsx>{`
        .shimmer {
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            hsl(var(--muted)) 0%,
            hsl(var(--background)) 50%,
            hsl(var(--muted)) 100%
          );
          background-size: 200% 100%;
          animation: shimmerSlide 1.4s ease-in-out infinite;
        }
        @keyframes shimmerSlide {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </section>
  )
}
