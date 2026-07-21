import { useEffect, useMemo, useRef, useState } from "react"
import Player from "@vimeo/player"
import { extractFirstUrl, getVimeoEmbed, getYouTubeEmbed } from "@/lib/video-embed"

type UseIntroVideoOptions = {
  vimeoRich?: boolean
  autoplay?: boolean
}

export function useIntroVideo(postType: string, options: UseIntroVideoOptions = {}) {
  const { vimeoRich = false, autoplay = false } = options
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [loadingVideo, setLoadingVideo] = useState(true)
  const [videoFetched, setVideoFetched] = useState(false)
  const [videoReloadKey, setVideoReloadKey] = useState(0)
  const [videoEnded, setVideoEnded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const vimeoPlayerRef = useRef<Player | null>(null)
  const isVimeo = useMemo(() => (videoSrc || "").includes("player.vimeo.com"), [videoSrc])
  const isYouTube = useMemo(() => (videoSrc || "").includes("youtube") || (videoSrc || "").includes("youtu"), [videoSrc])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoadingVideo(true)
        if (videoReloadKey > 0) setVideoSrc(null)
        const params = new URLSearchParams({ postType, limit: "1" })
        const res = await fetch(`/api/posts?${params.toString()}`, { cache: "no-store" })
        const json = await res.json().catch(() => ({}))
        const list: { content?: string | null }[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
        const url = extractFirstUrl(list[0]?.content || "")
        const embed = url
          ? getYouTubeEmbed(url, { autoplay, muted: autoplay }) || getVimeoEmbed(url, { rich: vimeoRich, autoplay, muted: autoplay })
          : null
        if (!cancelled) setVideoSrc(embed)
      } finally {
        if (!cancelled) {
          setLoadingVideo(false)
          setVideoFetched(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [postType, videoReloadKey, vimeoRich, autoplay])

  useEffect(() => {
    setVideoEnded(false)
  }, [videoSrc, videoReloadKey])

  useEffect(() => {
    if (!videoSrc || !isVimeo || !iframeRef.current) {
      if (vimeoPlayerRef.current) {
        vimeoPlayerRef.current.unload().catch(() => {})
        vimeoPlayerRef.current = null
      }
      return
    }

    const player = new Player(iframeRef.current, { dnt: true })
    vimeoPlayerRef.current = player

    const handleEnded = async () => {
      setVideoEnded(true)
      try {
        await player.unload()
      } catch {}
    }

    player.on("ended", handleEnded)

    return () => {
      player.off("ended", handleEnded)
      player.unload().catch(() => {})
      if (vimeoPlayerRef.current === player) {
        vimeoPlayerRef.current = null
      }
    }
  }, [isVimeo, videoSrc, videoReloadKey])

  useEffect(() => {
    if (!videoSrc || !isYouTube) return

    const handleMessage = (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return
      let data = event.data
      if (typeof data === "string") {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }
      if (!data || typeof data !== "object") return

      if (data.event === "onReady") {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"] }),
          "*"
        )
      }
      if (data.event === "onStateChange" && data.info === 0) {
        setVideoEnded(true)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [isYouTube, videoSrc, videoReloadKey])

  const showVideoSection = loadingVideo || videoFetched

  const handleRetryVideo = () => {
    setLoadingVideo(true)
    setVideoFetched(false)
    setVideoSrc(null)
    setVideoEnded(false)
    setVideoReloadKey((value) => value + 1)
  }

  return {
    videoSrc,
    loadingVideo,
    videoEnded,
    videoReloadKey,
    iframeRef,
    showVideoSection,
    handleRetryVideo,
  }
}
