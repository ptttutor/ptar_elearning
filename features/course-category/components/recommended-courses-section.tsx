import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Clock } from "lucide-react"
import type { Course } from "@/hooks/use-recommended-courses"

export function RecommendedCoursesSection({ courses, loading }: { courses: Course[]; loading: boolean }) {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">คอร์สแนะนำ</h2>
        </div>
        <Link href="/courses">
          <Button
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300 bg-transparent"
          >
            ดูคอร์สทั้งหมด
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`sk-${i}`} className="overflow-hidden border-2 border-border">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted rounded-lg w-2/3 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                  <div className="h-10 bg-muted rounded-lg w-32 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="h-full hover:shadow-xl transition-shadow duration-300 group pt-0">
              <CardContent className="p-0">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <Image
                    src={course.coverImageUrl || "/placeholder.svg?height=200&width=350"}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground">{course.category?.name ?? "คอร์ส"}</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2 text-balance line-clamp-2">{course.title}</h3>
                  <p className="text-muted-foreground mb-4 text-pretty line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course._count?.enrollments ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course._count?.chapters ?? 0} บทเรียน</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{(course as any)?.duration ?? "-"}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-6">
                    {course.isFree || (course.price || 0) === 0 ? (
                      <span className="text-2xl font-bold text-green-600">ฟรี</span>
                    ) : (
                      (() => {
                        const original = Number(course.price || 0)
                        const d = course.discountPrice as number | null | undefined
                        const hasDiscount = d != null && d < original
                        const effective = hasDiscount ? Number(d) : original
                        return (
                          <>
                            {hasDiscount && (
                              <span className="text-sm text-muted-foreground line-through mr-1">฿{original.toLocaleString()}</span>
                            )}
                            <span className="text-2xl font-extrabold text-primary">฿{effective.toLocaleString()}</span>
                          </>
                        )
                      })()
                    )}
                  </div>
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">ดูรายละเอียด</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-lg">ยังไม่มีคอร์สแนะนำ</p>
        </div>
      )}
    </>
  )
}
