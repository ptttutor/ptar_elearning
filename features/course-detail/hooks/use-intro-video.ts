import { useEffect, useMemo, useRef, useState } from "react"
import Player from "@vimeo/player"
import { getEmbedSrc, isValidVideoUrl } from "@/features/course-detail/video-embed"

export function useIntroVideo(sampleVideo: string | null | undefined) {
  const [introSrc, setIntroSrc] = useState<string | null>(null)
  const introFrameRef = useRef<HTMLIFrameElement | null>(null)
  const introSectionRef = useRef<HTMLDivElement | null>(null)
  const introPlayerRef = useRef<Player | null>(null)
  const [introReplayVisible, setIntroReplayVisible] = useState(false)
  const [introEmbedKey, setIntroEmbedKey] = useState(0)
  const [introAutoplayNonce, setIntroAutoplayNonce] = useState(0)
  const isIntroVimeo = useMemo(() => introSrc?.includes("player.vimeo.com") ?? false, [introSrc])

  const introPlayableSrc = useMemo(() => {
    if (!introSrc) return null
    if (!introAutoplayNonce) return introSrc
    try {
      const url = new URL(introSrc)
      url.searchParams.set("autoplay", "1")
      url.searchParams.set("playsinline", "1")
      if (url.hostname.includes("youtube")) {
        // Keep sound policy-friendly while still auto-starting playback.
        url.searchParams.set("mute", "1")
      }
      return url.toString()
    } catch {
      return introSrc
    }
  }, [introSrc, introAutoplayNonce])

  useEffect(() => {
    setIntroSrc(getEmbedSrc(sampleVideo || null))
  }, [sampleVideo])

  useEffect(() => {
    setIntroAutoplayNonce(0)
  }, [introSrc])

  useEffect(() => {
    setIntroReplayVisible(false)
  }, [introSrc])

  useEffect(() => {
    if (!isIntroVimeo) {
      if (introPlayerRef.current) {
        introPlayerRef.current.unload().catch(() => {})
        introPlayerRef.current = null
      }
      return
    }
    if (!introFrameRef.current) return

    const player = new Player(introFrameRef.current, { dnt: true })
    introPlayerRef.current = player

    const handleEnded = async () => {
      setIntroReplayVisible(true)
      try {
        await player.unload()
      } catch {}
    }
    player.on("ended", handleEnded)

    return () => {
      player.off("ended", handleEnded)
      player.unload().catch(() => {})
      if (introPlayerRef.current === player) introPlayerRef.current = null
    }
  }, [isIntroVimeo, introSrc, introEmbedKey])

  const handleIntroReplay = () => {
    setIntroReplayVisible(false)
    setIntroEmbedKey((key) => key + 1)
  }

  const handlePreviewClick = (sampleVideoUrl: string | null | undefined) => {
    if (introSrc) {
      setIntroReplayVisible(false)
      setIntroAutoplayNonce((n) => n + 1)
      setIntroEmbedKey((key) => key + 1)
      introSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    const rawSample = (sampleVideoUrl || "").trim()
    if (isValidVideoUrl(rawSample)) {
      window.open(rawSample, "_blank", "noopener,noreferrer")
    }
  }

  return {
    introSrc,
    introFrameRef,
    introSectionRef,
    introReplayVisible,
    introEmbedKey,
    isIntroVimeo,
    introPlayableSrc,
    handleIntroReplay,
    handlePreviewClick,
  }
}
