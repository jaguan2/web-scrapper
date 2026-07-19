import { Box, Paper, Typography } from '@mui/material'
import { keyframes } from '@mui/system'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import { LinkInput } from '../components/scrape/LinkInput'
import { VideoCard } from '../components/scrape/VideoCard'
import { GalleryCard } from '../components/scrape/GalleryCard'
import { PuffyStar } from '../components/decor/PuffyStar'
import { stickerSwatches } from '../theme/palette'

const bounce = keyframes`
  0%, 100% { transform: translateY(0) rotate(-8deg); }
  50%      { transform: translateY(-10px) rotate(8deg); }
`

const PLATFORM_LABEL = {
  youtube: { text: 'youtube', sticker: 'peach' },
  instagram: { text: 'instagram', sticker: 'pink' },
  twitter: { text: 'x / twitter', sticker: 'blue' },
  other: { text: 'link', sticker: 'mint' },
}

/**
 * The whole scrape flow: hero + link input, then the resolved result —
 * video cards (MP4 quality ladder / MP3) and/or a photo gallery grid.
 */
export function ScrapePage({ state, onFetch }) {
  const { status, data, error } = state

  const images = data?.items?.filter((i) => i.type === 'image') ?? []
  const videos = data?.items?.filter((i) => i.type === 'video') ?? []
  const badge = PLATFORM_LABEL[data?.platform] ?? PLATFORM_LABEL.other

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: { xs: 3, md: 5 } }}>
      {/* Hero */}
      <Box sx={{ textAlign: 'center', mt: { xs: 1, md: 3 } }}>
        <Typography component="h1" sx={{ fontSize: { xs: 34, md: 48 }, fontWeight: 700, lineHeight: 1.15 }}>
          Snag the internet’s
          <Box component="span" sx={{ color: 'primary.main' }}> good stuff</Box>
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontWeight: 500, fontSize: { xs: 15, md: 17 }, mt: 1 }}>
          An ad-free media grabber. No popups, no countdown timers, no “premium”.
        </Typography>
      </Box>

      <LinkInput onSubmit={onFetch} busy={status === 'loading'} />

      {status === 'loading' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 3 }}>
          <Box sx={{ animation: `${bounce} 1.1s ease-in-out infinite`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}>
            <PuffyStar color={stickerSwatches.pink.light} size={64} />
          </Box>
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
            reading that link…
          </Typography>
        </Box>
      )}

      {status === 'error' && (
        <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ErrorOutlineRoundedIcon sx={{ color: 'error.main' }} />
          <Typography sx={{ fontWeight: 600 }}>{error}</Typography>
        </Paper>
      )}

      {status === 'done' && data && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Result header: platform sticker + post title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography
              component="span"
              sx={(theme) => ({
                px: 1.5,
                py: 0.25,
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 700,
                bgcolor: theme.snag.stickers[badge.sticker],
                border: `2px solid ${theme.snag.sticker.peel}`,
                boxShadow: theme.snag.sticker.shadow,
                transform: 'rotate(-1.5deg)',
              })}
            >
              {badge.text}
            </Typography>
            {(data.title || data.uploader) && (
              <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 14.5 }}>
                {[data.uploader, data.title].filter(Boolean).join(' · ').slice(0, 120)}
              </Typography>
            )}
          </Box>

          {images.length > 0 && (
            <GalleryCard images={images} title={data.title} platform={data.platform} />
          )}
          {videos.map((v, i) => (
            <VideoCard key={i} item={v} />
          ))}
        </Box>
      )}
    </Box>
  )
}
