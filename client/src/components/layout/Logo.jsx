import { Box, Typography, ButtonBase } from '@mui/material'
import { PuffyStar } from '../decor/PuffyStar'

// The logo star's color — a candy pink puffy star, matching the favicon.
const LOGO_STAR_COLOR = '#f8a8d0'

/** Snag wordmark: a glowing puffy star sticker + the name. Resets the app. */
export function Logo({ onGoHome }) {
  return (
    <ButtonBase
      component="a"
      href="/"
      aria-label="Snag home"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
        e.preventDefault()
        onGoHome?.()
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        borderRadius: 2,
        textDecoration: 'none',
        '&:hover .logo-star': { transform: 'rotate(-12deg) scale(1.08)' },
        '&:focus-visible': {
          outline: (t) => `2px solid ${t.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        className="logo-star"
        sx={{
          display: 'flex',
          transition: 'transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          filter: `drop-shadow(0 0 10px ${LOGO_STAR_COLOR}88)`,
        }}
      >
        <PuffyStar color={LOGO_STAR_COLOR} size={40} />
      </Box>
      <Typography
        component="span"
        sx={{ fontSize: 30, fontWeight: 700, lineHeight: 1, color: 'text.primary' }}
      >
        Snag
      </Typography>
    </ButtonBase>
  )
}
