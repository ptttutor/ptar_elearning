export function getYouTubeEmbedUrl(url: string) {
  const id = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/)?.[1]
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null
}

export function getVimeoEmbedUrl(url: string) {
  const id = url.match(/(?:vimeo\.com|player\.vimeo\.com)\/(?:video\/)?(\d+)/)?.[1]
  return id ? `https://player.vimeo.com/video/${id}?dnt=1&title=0&byline=0&portrait=0` : null
}

export function getEmbedSrc(url?: string | null) {
  if (!url) return null
  return getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url)
}

export function isValidVideoUrl(url?: string | null) {
  if (!url) return false
  const value = String(url).trim()
  if (!value || value === "-") return false
  return /^https?:\/\//i.test(value)
}
