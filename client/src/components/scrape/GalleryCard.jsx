import { useState } from 'react'
import { Box, Paper, Typography, ButtonBase, CircularProgress } from '@mui/material'
import { alpha } from '@mui/material/styles'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import FolderZipRoundedIcon from '@mui/icons-material/FolderZipRounded'
import { StickerButton } from '../common/StickerButton'
import { StickerToggle } from '../common/StickerToggle'
import { imageDownloadUrl } from '../../utils/api'
import { downloadUrl, downloadZip } from '../../utils/download'
import { safeName } from '../../utils/format'

/**
 * A photo post: every image in a selectable grid. Downloads honor the JPG/PNG
 * choice (converted server-side); multiple photos can be zipped in one go.
 */
export function GalleryCard({ images, title, platform }) {
  const [fmt, setFmt] = useState('jpg')
  const [selected, setSelected] = useState(() => new Set())
  const [zipping, setZipping] = useState(false)
  const [error, setError] = useState(null)

  const base = safeName(title, `${platform}-post`)
  const nameFor = (i) => `${base} ${i + 1}.${fmt}`

  const toggle = (i) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const zipMany = async (indices) => {
    setZipping(true)
    setError(null)
    try {
      const items = await Promise.all(
        indices.map(async (i) => {
          const resp = await fetch(imageDownloadUrl(images[i].src, { format: fmt }))
          if (!resp.ok) throw new Error('One of the photos failed to fetch.')
          return { blob: await resp.blob(), filename: nameFor(i) }
        }),
      )
      await downloadZip(items, `${base}.zip`)
    } catch (err) {
      setError(err.message ?? 'Could not build the ZIP.')
    } finally {
      setZipping(false)
    }
  }

  const single = images.length === 1

  return (
    <Paper sx={{ p: { xs: 2, md: 2.5 } }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          mb: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 17, mr: 'auto' }}>
          {single ? '1 photo' : `${images.length} photos`}
          {selected.size > 0 && (
            <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 14, ml: 1 }}>
              · {selected.size} selected
            </Typography>
          )}
        </Typography>

        <StickerToggle
          ariaLabel="Image format"
          size="small"
          value={fmt}
          onChange={setFmt}
          options={[
            { value: 'jpg', label: 'JPG', sticker: 'lemon' },
            { value: 'png', label: 'PNG', sticker: 'lilac' },
          ]}
          sx={{ p: 0 }}
        />

        {!single && (
          <>
            {selected.size > 0 && (
              <StickerButton
                size="small"
                sticker="mint"
                disabled={zipping}
                onClick={() =>
                  selected.size === 1
                    ? downloadUrl(
                        imageDownloadUrl(images[[...selected][0]].src, {
                          format: fmt,
                          filename: nameFor([...selected][0]),
                        }),
                      )
                    : zipMany([...selected].sort((a, b) => a - b))
                }
                startIcon={<DownloadRoundedIcon sx={{ fontSize: 18 }} />}
              >
                download selected
              </StickerButton>
            )}
            <StickerButton
              size="small"
              sticker="blue"
              disabled={zipping}
              onClick={() => zipMany(images.map((_, i) => i))}
              startIcon={
                zipping ? (
                  <CircularProgress size={16} thickness={5} sx={{ color: 'text.primary' }} />
                ) : (
                  <FolderZipRoundedIcon sx={{ fontSize: 18 }} />
                )
              }
            >
              {zipping ? 'zipping…' : 'download all (.zip)'}
            </StickerButton>
          </>
        )}
        {single && (
          <StickerButton
            size="small"
            sticker="mint"
            onClick={() =>
              downloadUrl(imageDownloadUrl(images[0].src, { format: fmt, filename: nameFor(0) }))
            }
            startIcon={<DownloadRoundedIcon sx={{ fontSize: 18 }} />}
          >
            download {fmt}
          </StickerButton>
        )}
      </Box>

      {error && (
        <Typography sx={{ color: 'error.main', fontWeight: 600, fontSize: 13.5, mb: 1.5 }}>
          {error}
        </Typography>
      )}

      {/* Photo grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: single
            ? 'minmax(0, 420px)'
            : { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
          justifyContent: single ? 'center' : 'start',
          gap: 1.5,
        }}
      >
        {images.map((img, i) => {
          const isSelected = selected.has(i)
          return (
            <Box
              key={i}
              sx={(theme) => ({
                position: 'relative',
                borderRadius: `${theme.snag.radius - 8}px`,
                overflow: 'hidden',
                border: `3px solid ${isSelected ? theme.palette.primary.main : theme.snag.sticker.peel}`,
                boxShadow: isSelected ? theme.snag.sticker.shadowHover : theme.snag.sticker.shadow,
                transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                '@media (hover: hover)': {
                  '&:hover': { transform: 'translateY(-3px)' },
                  '&:hover .tile-actions': { opacity: 1 },
                },
              })}
            >
              <Box
                component="img"
                src={img.src}
                alt={`Photo ${i + 1}`}
                loading="lazy"
                onClick={() => !single && toggle(i)}
                sx={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  cursor: single ? 'default' : 'pointer',
                }}
              />

              {/* Selection check (multi-photo posts only) */}
              {!single && (
                <ButtonBase
                  onClick={() => toggle(i)}
                  aria-label={isSelected ? `Deselect photo ${i + 1}` : `Select photo ${i + 1}`}
                  aria-pressed={isSelected}
                  sx={(theme) => ({
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    bgcolor: isSelected
                      ? theme.palette.primary.main
                      : alpha(theme.palette.background.paper, 0.85),
                    border: `2px solid ${theme.snag.sticker.peel}`,
                    boxShadow: theme.snag.sticker.shadow,
                    transition: 'background-color 160ms ease, transform 160ms ease',
                    '&:hover': { transform: 'scale(1.1)' },
                  })}
                >
                  {isSelected && (
                    <CheckRoundedIcon
                      sx={{ fontSize: 20, color: (t) => t.palette.getContrastText(t.palette.primary.main) }}
                    />
                  )}
                </ButtonBase>
              )}

              {/* Per-photo download */}
              <Box
                className="tile-actions"
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  p: 1,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.45), transparent)',
                  opacity: { xs: 1, md: single ? 1 : 0 },
                  transition: 'opacity 180ms ease',
                }}
              >
                <ButtonBase
                  onClick={() =>
                    downloadUrl(imageDownloadUrl(img.src, { format: fmt, filename: nameFor(i) }))
                  }
                  aria-label={`Download photo ${i + 1} as ${fmt.toUpperCase()}`}
                  sx={(theme) => ({
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    border: `2px solid ${theme.snag.sticker.peel}`,
                    boxShadow: theme.snag.sticker.shadow,
                    transition: 'transform 160ms ease',
                    '&:hover': { transform: 'scale(1.1)' },
                  })}
                >
                  <DownloadRoundedIcon sx={{ fontSize: 19, color: 'text.primary' }} />
                </ButtonBase>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}
