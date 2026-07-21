import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { getVideoThumbnailUrl } from "@/features/course-player/video-embed"
import type { Chapter, Content } from "@/features/course-player/types"

export function RelatedContentGrid({
  currentChapter,
  selectedContentId,
  onSelectContent,
}: {
  currentChapter: Chapter
  selectedContentId?: string
  onSelectContent: (content: Content) => void
}) {
  return (
    <Card className="bg-background border-border">
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-semibold text-card-foreground mb-4">วิดีโออื่นๆ ใน Chapter {currentChapter.order}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...currentChapter.contents]
            .sort((a, b) => a.order - b.order)
            .filter((c) => c.id !== selectedContentId)
            .slice(0, 6)
            .map((c) => (
              <Card
                key={c.id}
                className="cursor-pointer hover:shadow-md transition-shadow bg-muted/30 border-border hover:border-primary py-0"
                onClick={() => onSelectContent(c)}
              >
                <CardContent className="p-3">
                  <div className="aspect-video bg-muted rounded mb-3 relative overflow-hidden">
                    <Image
                      src={(c.contentType === "VIDEO" && getVideoThumbnailUrl(c.contentUrl)) || "/placeholder.svg"}
                      alt={c.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h5 className="font-medium text-sm text-card-foreground text-balance line-clamp-2">{c.title}</h5>
                </CardContent>
              </Card>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
