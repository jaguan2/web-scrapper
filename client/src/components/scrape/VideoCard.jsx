import { useEffect, useRef, useState } from 'react'
import { Box, Paper, Typography, LinearProgress, Stack } from '@mui/material'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import MovieRoundedIcon from '@mui/icons-material/MovieRounded'
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded'
import { StickerButton } from '../common/StickerButton'
import { StickerToggle } from '../common/StickerToggle'
import { startJob, getJob, jobFileUrl, mediaProxyUrl } from '../../utils/api'
import { downloadUrl } from '../../utils/download'
import { formatBytes, formatDuration, safeName } from '../../utils/format'

// Rotate quality chips through the pastel palette so the ladder reads as a
// row of placed stickers.
const QUALITY_STICKERS = ['peach', 'blue', 'mint', 'lemon', 'lilac', 'pink']

/**
 * One downloadable video: thumbnail + metadata, MP4/MP3 toggle, a quality
 * ladder for MP4, and a download button that tracks server-side progress.
 */
export function VideoCard({ item }) {
  const [container, setContainer] = useState('mp4')
  const [height, setHeight] = useState(item.qualities?.[0]?.height ?? null)
  const [job, setJob] = useState(null) // { id, progress, phase } while running
  const [error, setError] = useState(null)
  const pollRef = useRef(null)

  useEffect(() => () => clearInterval(pollRef.current), [])

  const busy = Boolean(job)
  // Fallback path (e.g. a tweet video yt-dlp couldn't parse): no quality
  // ladder, but a direct CDN file we can pull straight through the proxy.
  const isDirect = Boolean(item.directUrl) && (item.qualities?.length ?? 0) === 0

  const download = async () => {
    setError(null)
    if (isDirect) {
      downloadUrl(mediaProxyUrl(item.directUrl, { filename: `${safeName(item.title)}.mp4` }))
      return
    }
    try {
      const { id } = await startJob({
        url: item.url,
        format: container,
        height: container === 'mp4' ? height : undefined,
        playlistIndex: item.playlistIndex,
      })
      setJob({ id, progress: 0, phase: 'starting' })
      // Closure-local guards: skip ticks while one is in flight, and make
      // sure a slow straggler can't double-trigger the finished download.
      let inFlight = false
      let finished = false
      pollRef.current = setInterval(async () => {
        if (inFlight || finished) return
        inFlight = true
        try {
          const state = await getJob(id)
          if (finished) return
          if (state.status === 'done') {
            finished = true
            clearInterval(pollRef.current)
            setJob(null)
            downloadUrl(jobFileUrl(id))
          } else if (state.status === 'error') {
            finished = true
            clearInterval(pollRef.current)
            setJob(null)
            setError(state.error ?? 'The download failed.')
          } else {
            setJob({ id, progress: state.progress, phase: state.phase })
          }
        } catch {
          if (!finished) {
            finished = true
            clearInterval(pollRef.current)
            setJob(null)
            setError('Lost track of the download — try again.')
          }
        } finally {
          inFlight = false
        }
      }, 700)
    } catch (err) {
      setError(err.message)
    }
  }

  const qualityOptions = (item.qualities ?? []).map((q, i) => ({
    value: q.height,
    label: q.fps ? `${q.label}${q.fps}` : q.label,
    sub: formatBytes(q.filesize) ?? undefined,
    sticker: QUALITY_STICKERS[i % QUALITY_STICKERS.length],
  }))

  return (
    <Paper sx={{ p: { xs: 2, md: 2.5 } }}>
      <Box sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
        {item.thumbnail && (
          <Box sx={{ position: 'relative', flexShrink: 0, alignSelf: { xs: 'center', sm: 'start' } }}>
            <Box
              component="img"
              src={item.thumbnail}
              alt=""
              sx={(theme) => ({
                width: { xs: '100%', sm: 220 },
                maxWidth: 320,
                aspectRatio: '16 / 9',
                objectFit: 'cover',
                borderRadius: `${theme.snag.radius - 8}px`,
                border: `3px solid ${theme.snag.sticker.peel}`,
                boxShadow: theme.snag.sticker.shadow,
                display: 'block',
              })}
            />
            {item.duration != null && (
              <Typography
                sx={{
                  position: 'absolute',
                  right: 10,
                  bottom: 10,
                  px: 1,
                  py: 0.1,
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 700,
                  bgcolor: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                }}
              >
                {formatDuration(item.duration)}
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Box>
            {item.title && (
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 17,
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.title}
              </Typography>
            )}
            {item.uploader && (
              <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13.5 }}>
                {item.uploader}
              </Typography>
            )}
          </Box>

          <StickerToggle
            ariaLabel="Output format"
            size="small"
            value={container}
            onChange={setContainer}
            options={[
              {
                value: 'mp4',
                label: 'MP4 video',
                sticker: 'blue',
                icon: <MovieRoundedIcon sx={{ fontSize: 17 }} />,
              },
              ...(item.canMp3
                ? [
                    {
                      value: 'mp3',
                      label: 'MP3 audio',
                      sticker: 'pink',
                      icon: <MusicNoteRoundedIcon sx={{ fontSize: 17 }} />,
                    },
                  ]
                : []),
            ]}
            sx={{ p: 0 }}
          />

          {container === 'mp4' && qualityOptions.length > 0 && (
            <StickerToggle
              ariaLabel="Video quality"
              size="small"
              value={height}
              onChange={setHeight}
              options={qualityOptions}
              sx={{ p: 0 }}
            />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
            <StickerButton
              sticker="mint"
              onClick={download}
              disabled={busy || (container === 'mp4' && qualityOptions.length > 0 && !height)}
              startIcon={<DownloadRoundedIcon sx={{ fontSize: 20 }} />}
            >
              {busy ? 'snagging…' : `download ${container}`}
            </StickerButton>

            {busy && (
              <Stack sx={{ flex: 1, minWidth: 180, gap: 0.5 }}>
                <LinearProgress variant="determinate" value={job.progress ?? 0} />
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary' }}>
                  {job.phase} · {job.progress ?? 0}%
                </Typography>
              </Stack>
            )}
          </Box>

          {error && (
            <Typography sx={{ color: 'error.main', fontWeight: 600, fontSize: 13.5 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  )
}
