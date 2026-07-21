export function extractFirstUrl(text?: string | null) {
  if (!text) return null
  const m = text.match(/https?:[^\s)\]]+/i)
  return m ? m[0] : null
}

type EmbedOptions = { autoplay?: boolean; muted?: boolean }

export function getYouTubeEmbed(url: string, options: EmbedOptions = {}) {
  const id = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/)?.[1]
  if (!id) return null
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    enablejsapi: "1",
    playsinline: "1",
  })
  if (options.autoplay) params.set("autoplay", "1")
  if (options.muted) params.set("mute", "1")
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}

type VimeoEmbedOptions = EmbedOptions & { rich?: boolean }

export function getVimeoEmbed(url: string, options: VimeoEmbedOptions = {}) {
  const id = url.match(/(?:vimeo\.com|player\.vimeo\.com)\/(?:video\/)?(\d+)/)?.[1]
  if (!id) return null
  const params = new URLSearchParams(
    options.rich
      ? { badge: "0", autopause: "0", player_id: "0", app_id: "58479", dnt: "1", title: "0", byline: "0", portrait: "0" }
      : { dnt: "1", title: "0", byline: "0", portrait: "0" }
  )
  if (options.autoplay) {
    params.set("autoplay", "1")
    params.set("playsinline", "1")
  }
  if (options.muted) params.set("muted", "1")
  return `https://player.vimeo.com/video/${id}?${params.toString()}`
}
