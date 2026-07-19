import { Box } from '@mui/material'
import { Header } from './Header'
import { Footer } from './Footer'
import { StarField } from '../decor/StarField'

/**
 * App frame: sticky header over a centered, max-width content column, atop a
 * decorative StarField background layer.
 */
export function AppLayout({ onGoHome, children }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary',
        transition: 'background-color 240ms ease, color 240ms ease',
        // Decorative bits can extend past the content edges; clip that overflow
        // so it never creates extra scroll area. `clip` (not `hidden`) keeps
        // the page scrolling on the document so the sticky header works.
        overflow: 'clip',
        maxWidth: '100%',
      }}
    >
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: 12,
          top: -60,
          zIndex: (t) => t.zIndex.tooltip + 1,
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'background.default',
          fontWeight: 700,
          textDecoration: 'none',
          transition: 'top 160ms ease',
          '&:focus-visible': { top: 12 },
        }}
      >
        Skip to main content
      </Box>

      <StarField />
      <Header onGoHome={onGoHome} />
      <Box
        component="main"
        id="main-content"
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          width: '100%',
          maxWidth: 1080,
          mx: 'auto',
          px: { xs: 2, md: 4 },
        }}
      >
        {children}
      </Box>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Footer />
      </Box>
    </Box>
  )
}
