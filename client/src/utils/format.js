/** Human-readable file size, e.g. 1536 → "1.5 KB". */
export function formatBytes(bytes) {
  if (!bytes || bytes < 0) return null
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`
}

/** Seconds → "m:ss" / "h:mm:ss". */
export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return null
  const s = Math.round(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

/** Filesystem-safe filename base derived from a post title. */
export function safeName(title, fallback = 'media') {
  const base = (title ?? '')
    .replace(/[/\\:*?"<>|#%&{}$!'@+`=]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
  return base || fallback
}
