export type ExamFile = {
  id: string | number
  fileName?: string
  filePath?: string
  fileType?: string
  uploadedAt?: string
  isDownload?: boolean
  url?: string
  fileUrl?: string
  downloadUrl?: string
  cloudinaryUrl?: string
  name?: string
  filename?: string
  originalName?: string
  publicId?: string
  mime?: string
  mimeType?: string
  contentType?: string
}

export type ExamDetail = {
  id: string
  title: string
  description?: string | null
  category?: { id: string; name: string }
  files?: ExamFile[]
}

export type ActiveFile = {
  id?: string
  name: string
  url: string
  type?: string
  isDownload?: boolean
}
