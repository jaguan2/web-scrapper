import { Box, Typography } from '@mui/material'

/** Quiet, minimal footer band. */
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        maxWidth: 1080,
        mx: 'auto',
        width: '100%',
        px: { xs: 3, md: 4 },
        py: { xs: 5, md: 7 },
        mt: { xs: 4, md: 6 },
        borderTop: (t) => `1px solid ${t.app.border}`,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 1.5,
      }}
    >
      <Typography sx={{ fontWeight: 500, fontSize: 15 }}>
        No ads. No trackers. Just your media
        <Box component="span" sx={{ color: 'secondary.main' }}>
          .
        </Box>
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
        Download only content you have the right to save.
      </Typography>
    </Box>
  )
}
