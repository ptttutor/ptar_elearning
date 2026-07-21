import type { MutableRefObject, ReactNode } from "react"
import { Button } from "@/components/ui/button"

type IntroVideoPlayerProps = {
  videoSrc: string | null
  loadingVideo: boolean
  videoEnded: boolean
  videoReloadKey: number
  iframeRef: MutableRefObject<HTMLIFrameElement | null>
  onRetry: () => void
  videoTitle: string
  variant?: "simple" | "rich"
  emptyState?: ReactNode
  endedMessage?: string
}

const DEFAULT_EMPTY_STATE = (
  <div className="text-center">
    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    </div>
    <p className="text-lg">ไม่พบวิดีโอแนะนำ</p>
  </div>
)

export function IntroVideoPlayer({
  videoSrc,
  loadingVideo,
  videoEnded,
  videoReloadKey,
  iframeRef,
  onRetry,
  videoTitle,
  variant = "simple",
  emptyState = DEFAULT_EMPTY_STATE,
  endedMessage = "ชมวิดีโอแนะนำจบแล้ว",
}: IntroVideoPlayerProps) {
  const iframeAttrs =
    variant === "rich"
      ? {
          frameBorder: "0",
          referrerPolicy: "strict-origin-when-cross-origin" as const,
          allow: "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share",
        }
      : {
          referrerPolicy: "no-referrer" as const,
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        }

  return (
    <>
      {videoSrc && (
        <iframe
          key={videoReloadKey}
          ref={iframeRef}
          src={videoSrc}
          className="w-full h-full"
          allowFullScreen
          title={videoTitle}
          {...iframeAttrs}
        />
      )}
      {videoSrc && videoEnded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/85 text-white px-6 text-center">
          <div className="space-y-2">
            <p className="text-lg font-semibold">{endedMessage}</p>
            <p className="text-sm text-white/80">กดปุ่มด้านล่างเพื่อชมซ้ำ</p>
          </div>
          <Button onClick={onRetry} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            ดูอีกครั้ง
          </Button>
        </div>
      )}
      {loadingVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      {!videoSrc && !loadingVideo && (
        <div className="absolute inset-0 flex items-center justify-center text-white/90">{emptyState}</div>
      )}
    </>
  )
}
