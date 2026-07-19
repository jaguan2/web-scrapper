import { ytdlpJson, friendlyYtdlpError } from './ytdlp.js'
import { detectPlatform, normalizeYtdlp } from './normalize.js'
import { resolveTwitter } from './twitter.js'
import { resolveInstagram } from './instagram.js'

/**
 * Resolve any supported link into { platform, title, uploader, sourceUrl, items }.
 * Platform-specific paths handle the cases plain yt-dlp misses (photo tweets,
 * Instagram image carousels); everything else goes straight through yt-dlp.
 */
export async function resolveUrl(url) {
  const platform = detectPlatform(url)

  if (platform === 'twitter') {
    try {
      return await resolveTwitter(url)
    } catch (err) {
      if (err.friendly) throw err
      // fxtwitter hiccup — yt-dlp below still covers video tweets.
    }
  }

  if (platform === 'instagram') {
    return resolveInstagram(url)
  }

  try {
    const info = await ytdlpJson(url, platform === 'youtube' ? { noPlaylist: true } : {})
    const normalized = normalizeYtdlp(info, url, platform)
    if (normalized.items.length === 0) {
      const e = new Error('Could not find any downloadable media in that link.')
      e.friendly = e.message
      throw e
    }
    return normalized
  } catch (err) {
    throw err.friendly ? err : friendlyYtdlpError(err)
  }
}
