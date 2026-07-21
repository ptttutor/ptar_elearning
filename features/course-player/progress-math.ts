export function indexToProgress(index: number, total: number) {
  if (total <= 0) return 0
  return Math.round(((index + 1) / total) * 100)
}

export function progressToIndex(progress: number, total: number) {
  if (total <= 0) return -1
  let best = -1
  for (let i = 0; i < total; i++) {
    const p = indexToProgress(i, total)
    if (p <= progress) best = i
    else break
  }
  return best
}
