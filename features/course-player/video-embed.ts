export function getYouTubeEmbedUrl(url: string) {
  const idMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/)?.[1]
  return idMatch ? `https://www.youtube-nocookie.com/embed/${idMatch}?rel=0&modestbranding=1` : null
}

export function getVimeoEmbedUrl(url: string) {
  const idMatch = url.match(/(?:vimeo\.com|player\.vimeo\.com)\/(?:video\/)?(\d+)/)?.[1]
  if (!idMatch) return null

  const params = new URLSearchParams({
    badge: "0",
    autopause: "0",
    player_id: "0",
    app_id: "58479",
    dnt: "1",
    title: "0",
    byline: "0",
    portrait: "0",
  })

  return `https://player.vimeo.com/video/${idMatch}?${params.toString()}`
}

export function getEmbedSrc(url: string) {
  return getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url) || null
}

export function getVideoThumbnailUrl(url: string) {
  const ytId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/)?.[1]
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
  const vmId = url.match(/(?:vimeo\.com|player\.vimeo\.com)\/(?:video\/)?(\d+)/)?.[1]
  if (vmId) return `https://vumbnail.com/${vmId}.jpg`
  return null
}
