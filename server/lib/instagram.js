// Instagram resolution. yt-dlp covers reels and video posts, but image posts
// and photo carousels often come back empty — so image discovery goes through
// the public /embed/captioned page, whose inline JSON (or fallback <img>)
// exposes display URLs without a login. Both sources run in parallel and get
// merged. A cookies.txt (see README) unlocks private/login-gated posts.

import { ytdlpJson, friendlyYtdlpError, BROWSER_UA } from './ytdlp.js'
import { normalizeYtdlp, proxied } from './normalize.js'

const EMBED_HEADERS = {
  'user-agent': BROWSER_UA,
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
}

export async function resolveInstagram(url) {
  const [viaYtdlp, viaEmbed] = await Promise.allSettled([
    ytdlpJson(url),
    scrapeEmbedImages(url),
  ])

  const items = []
  let title = null
  let uploader = null

  if (viaYtdlp.status === 'fulfilled') {
    const normalized = normalizeYtdlp(viaYtdlp.value, url, 'instagram')
    title = normalized.title
    uploader = normalized.uploader
    items.push(...normalized.items)
  }

  if (viaEmbed.status === 'fulfilled') {
    const embed = viaEmbed.value
    title ??= embed.title
    uploader ??= embed.uploader
    const alreadyHasImages = items.some((i) => i.type === 'image')
    const videoCount = items.filter((i) => i.type === 'video').length
    // If yt-dlp already found the post's videos and the embed page only
    // surfaced one image, that image is just the video cover — skip it.
    const coverOnly = videoCount > 0 && embed.images.length <= videoCount
    if (!alreadyHasImages && !coverOnly) {
      items.push(...embed.images)
    }
  }

  if (items.length === 0) {
    if (viaYtdlp.status === 'rejected') throw friendlyYtdlpError(viaYtdlp.reason)
    const e = new Error(
      'Could not find any media in that post. If it’s from a private account, export cookies to server/cookies.txt.',
    )
    e.friendly = e.message
    throw e
  }

  return { platform: 'instagram', title, uploader, sourceUrl: url, items }
}

/** Pull image URLs out of the public embed page for a post. */
async function scrapeEmbedImages(url) {
  // Share links (/share/...) redirect to the canonical /p/ or /reel/ URL.
  let finalUrl = url
  try {
    const head = await fetch(url, { headers: EMBED_HEADERS, redirect: 'follow' })
    finalUrl = head.url || url
  } catch {
    // Network hiccup on the redirect probe — try the original URL's shortcode.
  }
  const code =
    finalUrl.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)?.[1] ??
    url.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)?.[1]
  if (!code) throw new Error('no shortcode in URL')

  const resp = await fetch(`https://www.instagram.com/p/${code}/embed/captioned/`, {
    headers: EMBED_HEADERS,
  })
  if (!resp.ok) throw new Error(`embed page ${resp.status}`)
  const html = await resp.text()

  const images = []
  let title = null
  let uploader = null

  // Preferred: the inline contextJSON blob holds the full GraphQL media tree,
  // including every carousel slide.
  const ctx = html.match(/"contextJSON":"((?:[^"\\]|\\.)*)"/)
  if (ctx) {
    try {
      const context = JSON.parse(JSON.parse(`"${ctx[1]}"`))
      const gql = typeof context.gql_data === 'string' ? JSON.parse(context.gql_data) : context.gql_data
      const media = gql?.shortcode_media ?? deepFind(gql, 'shortcode_media') ?? gql
      if (media) {
        uploader = media.owner?.username ? `@${media.owner.username}` : null
        title = media.edge_media_to_caption?.edges?.[0]?.node?.text?.slice(0, 120) ?? null
        const slides = media.edge_sidecar_to_children?.edges?.map((e) => e.node) ?? [media]
        for (const node of slides) {
          if (node?.is_video) continue
          if (node?.display_url) {
            images.push({
              type: 'image',
              src: proxied(node.display_url, 'https://www.instagram.com/'),
              width: node.dimensions?.width ?? null,
              height: node.dimensions?.height ?? null,
            })
          }
        }
      }
    } catch {
      // Fall through to the <img> fallback below.
    }
  }

  // Fallback: the embed page's main media <img> (first slide only).
  if (images.length === 0) {
    const img = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/)
    if (img) {
      images.push({
        type: 'image',
        src: proxied(decodeHtml(img[1]), 'https://www.instagram.com/'),
        width: null,
        height: null,
      })
    }
  }

  if (images.length === 0) throw new Error('no images found in embed page')
  return { images, title, uploader }
}

/** Depth-first search for a key anywhere in a JSON tree. */
function deepFind(obj, key, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 8) return null
  if (obj[key]) return obj[key]
  for (const v of Object.values(obj)) {
    const found = deepFind(v, key, depth + 1)
    if (found) return found
  }
  return null
}

function decodeHtml(s) {
  return s
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}
