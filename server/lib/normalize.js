// Turns raw yt-dlp info JSON into the app's normalized shape:
// { platform, title, uploader, sourceUrl, items: [videoItem | imageItem] }
//
// A video item carries a quality ladder (unique heights) so the client can
// offer 1080p/720p/... choices; an image item is a direct (proxied) URL.

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'avif'])

export function detectPlatform(url) {
  const host = safeHost(url)
  if (/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(host)) return 'youtube'
  if (/(^|\.)instagram\.com$/.test(host)) return 'instagram'
  if (/(^|\.)twitter\.com$|(^|\.)x\.com$/.test(host)) return 'twitter'
  return 'other'
}

function safeHost(url) {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ''
  }
}

/** Build a same-origin proxy URL for a remote asset (dodges CORS/hotlinking). */
export function proxied(src, referer) {
  if (!src) return null
  let out = `/api/media?src=${encodeURIComponent(src)}`
  if (referer) out += `&referer=${encodeURIComponent(referer)}`
  return out
}

export function normalizeYtdlp(info, sourceUrl, platform) {
  const items = []
  if (info._type === 'playlist' && Array.isArray(info.entries)) {
    info.entries.forEach((entry, i) => {
      if (!entry) return
      const item = entryToItem(entry, sourceUrl)
      if (item) {
        // Carousel entries often share the post URL; remember the index so a
        // download job can target just this entry (--playlist-items).
        if (item.type === 'video') item.playlistIndex = i + 1
        items.push(item)
      }
    })
  } else {
    const item = entryToItem(info, sourceUrl)
    if (item) items.push(item)
  }

  return {
    platform,
    title: info.title ?? null,
    uploader: info.uploader ?? info.channel ?? info.uploader_id ?? null,
    sourceUrl,
    items,
  }
}

function entryToItem(entry, sourceUrl) {
  const formats = Array.isArray(entry.formats) ? entry.formats : []
  const videoFormats = formats.filter((f) => f.vcodec && f.vcodec !== 'none')

  if (videoFormats.length === 0) {
    // No video streams at all — treat the best URL as a still image if it
    // looks like one.
    const best = formats[formats.length - 1] ?? entry
    const src = best.url ?? entry.url
    const ext = (best.ext ?? entry.ext ?? '').toLowerCase()
    if (src && (IMAGE_EXTS.has(ext) || /\.(jpe?g|png|webp)(\?|$)/i.test(src))) {
      return {
        type: 'image',
        src: proxied(src, sourceUrl),
        width: best.width ?? entry.width ?? null,
        height: best.height ?? entry.height ?? null,
      }
    }
    return null
  }

  return {
    type: 'video',
    url: entry.webpage_url ?? entry.original_url ?? sourceUrl,
    title: entry.title ?? null,
    uploader: entry.uploader ?? entry.channel ?? null,
    duration: entry.duration ?? null,
    thumbnail: proxied(entry.thumbnail, sourceUrl),
    qualities: qualityLadder(formats),
    canMp3: formats.some((f) => f.acodec && f.acodec !== 'none'),
  }
}

/** Unique heights (desc), each with fps + a rough total-size estimate. */
function qualityLadder(formats) {
  const withVideo = formats.filter((f) => f.vcodec && f.vcodec !== 'none' && f.height)
  const bestAudio = formats
    .filter((f) => f.acodec && f.acodec !== 'none' && f.vcodec === 'none')
    .sort((a, b) => (b.abr ?? 0) - (a.abr ?? 0))[0]
  const audioSize = bestAudio?.filesize ?? bestAudio?.filesize_approx ?? 0

  const heights = [...new Set(withVideo.map((f) => f.height))].sort((a, b) => b - a)
  return heights.map((h) => {
    const best = withVideo
      .filter((f) => f.height === h)
      .sort((a, b) => (b.tbr ?? 0) - (a.tbr ?? 0))[0]
    const videoSize = best.filesize ?? best.filesize_approx ?? 0
    // Progressive formats already include audio; merged ones need it added.
    const total = videoSize + (best.acodec && best.acodec !== 'none' ? 0 : audioSize)
    return {
      height: h,
      label: `${h}p`,
      fps: best.fps && best.fps > 30 ? Math.round(best.fps) : null,
      filesize: total || null,
    }
  })
}
