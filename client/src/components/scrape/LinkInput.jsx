import { useState } from 'react'
import { Box, Paper, InputBase, CircularProgress } from '@mui/material'
import { alpha } from '@mui/material/styles'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import { StickerButton } from '../common/StickerButton'

/**
 * The paste-a-link zone — Snag's answer to Morph's UploadZone. A big glass
 * panel with a dashed inner well holding the URL field and the fetch button.
 */
export function LinkInput({ onSubmit, busy }) {
  const [url, setUrl] = useState('')
  const canGo = /^https?:\/\/\S+/i.test(url.trim()) && !busy

  const submit = () => {
    if (canGo) onSubmit?.(url.trim())
  }

  return (
    <Paper sx={{ p: { xs: 1.5, md: 2 }, transition: 'background-color 240ms ease' }}>
      <Box
        sx={(theme) => ({
          borderRadius: `${theme.snag.radius - 6}px`,
          border: '3px dashed',
          borderColor: theme.snag.dropZoneBorder,
          px: { xs: 2, md: 3 },
          py: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          textAlign: 'center',
          transition: 'border-color 200ms ease',
          '&:focus-within': { borderColor: 'primary.main' },
        })}
      >
        <Box
          component="h2"
          sx={{ m: 0, fontSize: { xs: 22, md: 28 }, fontWeight: 700, lineHeight: 1.2 }}
        >
          Paste a link, keep the media
        </Box>
        <Box sx={{ color: 'text.secondary', fontWeight: 500, fontSize: 14.5, mt: -1 }}>
          YouTube videos · Instagram posts & reels · X posts — as MP4, MP3, JPG, or PNG
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            width: '100%',
            maxWidth: 640,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={(theme) => ({
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              borderRadius: 999,
              bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'light' ? 0.05 : 0.08),
              border: `2px solid ${theme.palette.divider}`,
              transition: 'border-color 160ms ease, box-shadow 160ms ease',
              '&:focus-within': {
                borderColor: 'primary.main',
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}`,
              },
            })}
          >
            <LinkRoundedIcon sx={{ color: 'text.secondary' }} />
            <InputBase
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
              }}
              placeholder="https://…"
              fullWidth
              inputProps={{ 'aria-label': 'Post link', spellCheck: false }}
              sx={{ py: 1.1, fontWeight: 600, fontSize: 15.5 }}
            />
          </Box>

          <StickerButton
            sticker="peach"
            onClick={submit}
            disabled={!canGo}
            startIcon={
              busy ? (
                <CircularProgress size={18} thickness={5} sx={{ color: 'text.primary' }} />
              ) : (
                <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
              )
            }
          >
            {busy ? 'reading the link…' : 'snag it'}
          </StickerButton>
        </Box>
      </Box>
    </Paper>
  )
}
